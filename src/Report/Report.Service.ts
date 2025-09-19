import Boq from '../BOQ/Boq.model'
import PO from '../PurchesOrder/Po.Model'
import Item from '../Items/Item.Model'
import Vendor from '../Vendors/Vendor.Model'
import Team from '../Team/Team.Model'
import Indent from '../Indent/Indent.Model'

export const getReport = async ()=>{
     const openPOCount = await PO.countDocuments({ status: "open" });
     const ItemCount = await Item.countDocuments();
     const VendorCount = await Vendor.countDocuments();
     const TeamCount = await Team.countDocuments();
     const activeCount = await Boq.countDocuments({ status: "active" });
       const spends = await Indent.aggregate([
    { $unwind: "$items" },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalSpend: { $sum: "$items.selectedVendor.totalPrice" }
      }
    },

    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
     const result = spends.map((month, i) => {
    if (i === 0) {
      return { ...month, trend: "N/A", percentageChange: 0 };
    }

    const prev = spends[i - 1].totalSpend || 0;
    const curr = month.totalSpend || 0;

    let trend: "rise" | "fall" | "same";
    let percentageChange = 0;

    if (curr > prev) {
      trend = "rise";
      percentageChange = ((curr - prev) / prev) * 100;
    } else if (curr < prev) {
      trend = "fall";
      percentageChange = ((prev - curr) / prev) * 100;
    } else {
      trend = "same";
      percentageChange = 0;
    }

    return {
      ...month,
      trend,
      percentageChange: Number(percentageChange.toFixed(2)) 
    };
  });
  
    return {activeCount,openPOCount, ItemCount, VendorCount, TeamCount, spends, result}
}