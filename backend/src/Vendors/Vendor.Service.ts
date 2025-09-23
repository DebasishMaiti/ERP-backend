import Vendor from "./Vendor.Model";
export const createVendor = async (name:String, contactPerson:String, phone:String, email:String, address:String, gstin:String, paymentDays:Number, notes:String, status:String) =>{
    const result = await Vendor.create({
        name, contactPerson, phone, email, address, gstin, paymentDays, notes,status
    });
    return result;
}

export const getVendors = async ()=>{
    const result = await Vendor.find();

    return result;
};
 
export const getVendorById = async (id : String)=>{
    const result = await Vendor.findOne({ vendorId: id });
    
    return result;
}

export const updateVendor = async (name:String, contactPerson:String, phone:String, email:String, address:String, gstin:String, paymentDays:Number, active:Boolean, notes:String, id:string)=>{
    console.log(id);
    const result = await Vendor.findOneAndUpdate({vendorId:id},{
        name, contactPerson, phone, email, address, gstin, paymentDays, active, notes
    });
    return result;
}

export const deleteVendor = async (id: String)=>{
    const result = await Vendor.findByIdAndDelete(id);
    return result;
}