import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
        unique:true
    },
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Customer",
        required:true
    },
deliveryPartner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"DeliveryPartner"
},
branch:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Branch",
    required:true
},
items:[
    {
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true,
        },
        item:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true,
        },
        counts:{type:Number,required:true},
    },
],
 deliveryLocation:{
    latitude:{type:Number,required:true},
    longitude:{type:Number,required:true},
    adress:{type:String},

 },
 pickupLocation:{
    latitude:{type:Number,required:true},
    longitude:{type:Number,reqyured:true},
    address:{type:String},
 },
 deliveryPersonLocation:{
    latitude:{type:Number},
    longitude:{type:Number},
    address:{type:String},
 },
  totalPrice:{type:Number,required:true},
  createdAt:{type:Date,default:Date.now},
  updatedAt:{type:Date,default:Date.now},
     

});

async function getNextSequenceValue(sequenceName){
    const sequenceDocument=await Counter.findOneAndUpdate(
        {name:sequenceName},
        {$inc:{sequence_value:1}},
        {new:true,upsert:true}
    );
    return sequenceDocument.sequence_value;
}

//save hone se phale ye fxn chalta h


orderSchema.pre('save', async function (next) {
    if (this.isNew) {
      const sequenceValue = await getNextSequenceValue("orderId");
      this.orderId = `ORDR${sequenceValue.toString().padStart(5, '0')}`; // 🔧 fixed closing quote
    }
    next();
  }); 
  
  const Order = mongoose.model("Order",orderSchema)
  export default Order