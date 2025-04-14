import Order from "../../models/Order.js";
import Branch from "../../models/branch.js";
import {Customer,DeliveryPartner} from "../../models/user.js"


export const createOrder = async(req,reply)=>{
    try{
        const{userId}=userId.user;
        const {items,branch,totalPrice}=req.body
        const customerData = await Customer.findById(userId)
        const branchData = await Branch.findById(branch)
        if(!customerData){
            return reply.status(404).send({message:"Customer not found"});

        }
        const newOrder=new Order({
            customer:userId,
            items:items.map((item)=>({
                id:items.id,
                item:item.item,
                count:item.count
            })),
            branch,
            totalPrice,
            deliveryLocation:{
                latitude:customerData.liveLocation.latitude,
                longitude:customerData.liveLocation.longitude,
                address:customerData.address || "No address available",
            },
            pickupLocation:{
                latitude:branchData.location.latitude,
                longitude:branchData.location.longitude,
                address:branchData.address || "No address available",
            }
        });
        const savedOrder = await newOrder.save()
        return reply.status(201).send(savedOrder)
    }
    catch(error){
        console.log(err);
        return reply.status(500).send({message: "Failed to create order",error});
    }
}

export const confirmOrder = async(req,reply)=>{
try{
    const {orderId} =req.params;
    const {userId}=req.user;
    const{deliveryPersonLocation} = req.body;

    const deliveryPerson = await DeliveryPartner.findById(userId);
    if(!deliveryPerson){
        return reply.status(304).send({message : "Delivery Person not found"});
    }
    const order = await Order.findById(orderId);
    if(!order) return reply.status(404).send({message:"Order not found"});
 
    if(order.status !== "available"){
        return reply.status(400).send({message:"Order is not Available"});
    }
    order.status = "confirmed";
    order.deliveryPartner = userId;
    order.deliveryPersonLocation={
        latitude:deliveryPersonLocation?.latitude,
        longitude:deliveryPersonLocation?.longitude,
        address:deliveryPersonLocation.address || "",

    };
    //room h orderId
    req.server.io.to(orderId).emit('orderConfirmed',order);
    await order.save()
    return reply.send(order)
}
catch(error){
    return reply
 .status(500)
 .send({message: "Failed to confirm order",error});
}
}

export const updateOrderStatus=async(req,reply)=>{
 try{ const {orderId}=req.params;
 const {status,deliveryPersonLocation}=req.body;
 const {userId}=req.user; 
 const deliveryPerson = await DeliveryPartner.findById(userId);
    if(!deliveryPerson){
        return reply.status(304).send({message : "Delivery Person not found"});
    }
    const order = await Order.findById(orderId);
    if(!order) return reply.status(404).send({message:"Order not found"});


    // jab order cancel ho gaya ya delivered to fir se arriving nh kar sakte
    if(["cancelled","delivered"].includes(order.status)){
        return reply.status(400).send({message:"Order cannot be updated"});

    }
  //  jo jis order pe assign h whi us order ke status ko change karega
    if(order.deliveryPartner.toString()!==userId){
        return reply.status(403).send({message:"Unathorised"})
    }
    order.status = status;
    order.deliveryPersonLocation=deliveryPersonLocation;
    await order.save();
    req.server.io(orderId).emit("liveTrackingUpdates",order);
    return reply.send(order);
}
catch(error){
    return reply
    .status(500)
    .send({message:"Failed to update order status",error});
}
}

export const getOrders= async(req,reply)=>{
    try{
        const {status,customerId,deliveryPartnerId,branchId}= req.query;
        let query = {};
        if (status){
            query.status=status;
                }
                if(customerId){
                    query.customer=customerId;
                }
               if(deliveryPartnerId){
                query.deliveryPartner=deliveryPartnerId;
                query.branch=branchId;
               } 
               const orders= await Order.find(query).populate(
                "Customer branch items.item deliveryPartner"
               );
               return reply.send(orders);
    }
    catch(error){
        return reply
        .status(500)
        .send({message:"Failed to retrieve orders",error});
    }
}