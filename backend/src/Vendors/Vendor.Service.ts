import Vendor from "./Vendor.Model";
import Item from "../Items/Item.Model";
export const createVendor = async (name:String, contactPerson:String, phone:String, email:String, address:String, gstin:String, paymentDays:Number, notes:String, status:String) =>{
    const result = await Vendor.create({
        name, contactPerson, phone, email, address, gstin, paymentDays, notes,status
    });
    return result;
}

export const getVendors = async ()=>{
    return await Vendor.find();
 
};
 
export const getVendorById = async (id : String)=>{
    const result = await Vendor.findOne({ vendorId: id });
    const vid = result?._id
    const item = await Item.find({"vendors.vendor":vid});
    return {result,item};
}

export const updateVendor = async (name:String, contactPerson:String, phone:String, email:String, address:String, gstin:String, paymentDays:Number, active:Boolean, notes:String, id:string)=>{
 
    const result = await Vendor.findOneAndUpdate({vendorId:id},{
        name, contactPerson, phone, email, address, gstin, paymentDays, active, notes
    });
    return result;
}

export const deleteVendor = async (id: String)=>{
    const result = await Vendor.findByIdAndDelete(id);
    return result;
}