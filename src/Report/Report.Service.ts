import Boq from '../BOQ/Boq.model';
import PO from '../PurchesOrder/Po.Model';
import Item from '../Items/Item.Model';
import Vendor from '../Vendors/Vendor.Model';
import Team from '../Team/Team.Model';
import Indent from '../Indent/Indent.Model';

export const getReport = async () => {
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

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const currentMonth = spends.find(
    s => s._id.year === year && s._id.month === month
  );

  const curr = currentMonth ? currentMonth.totalSpend : 0;

  return {
    activeCount,
    openPOCount,
    ItemCount,
    VendorCount,
    TeamCount,
    monthlySpend: curr
  };
};
