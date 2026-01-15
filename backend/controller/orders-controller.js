const OrdersModel = require('../models/orders-model')
const HttpError = require('../models/http-error')

const UserModel = require('../models/user-model')
const mongoose = require('mongoose')

const jwt = require('jsonwebtoken')
const ridersModel = require('../models/riders-model')

//Authentiated Approved User
const authenticateApprovedUserToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    jwt.verify(token, "super-duper-hassan-secret-dont-share", (err, user) => {
        if (err) {
            // Token is either expired or invalid
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;

        if (req.user.status !== "approved") {
            return next(new HttpError('Only Admin is authenticated', 403))
        }
        next();
    });
};



const authenticateVendorToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    jwt.verify(token, "super-duper-hassan-secret-dont-share", (err, user) => {
        if (err) {
            // Token is either expired or invalid
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;

        if (req.user.status !== "vendor") {
            return next(new HttpError('Only vendor is authenticated', 403))
        }
        next();
    });
};


const authenticateAdminAndRiderAndApprovedandVendorToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    jwt.verify(token, "super-duper-hassan-secret-dont-share", (err, user) => {
        if (err) {
            // Token is either expired or invalid
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;

        if (req.user.status === "") {
            return next(new HttpError('Not authenticated', 403))
        }
        next();
    });
};


const authenticateAdminAndRiderToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        let decoded
        try {
            decoded = jwt.verify(token, "super-duper-hassan-secret-dont-share");
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }

        if (decoded.status === "admin") {
            return next()
        }

        const rider = await ridersModel.findById(decoded.ridersId)
        if (!rider) {
            return next(new HttpError('Not authenticated', 403));
        }

        next();
    }
    catch (err) {
        return next(new HttpError('Authentication Error', 500))
    }
};

//CREATING DATA
const createOrders = async (req, res, next) => {
    const { OrderType, OrderAmount, CustomerName, DeliveryCity, PickupCity, OrderDate, CustomerContactNo, DeliveryAddress, PickupAddress, Items, fragility, weight } = req.body;

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    let creatorId;
    let creatorName;
    try {
        const decoded = jwt.verify(token, "super-duper-hassan-secret-dont-share");
        creatorId = decoded.userId;
        creatorName = decoded.Name;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }

    const perfectOrderTrackingId = `mgc-${new Date(OrderDate).getTime().toString().slice(-9)}${parseInt(Math.random() * 10)}${CustomerContactNo.slice(-4)}`

    let trackId;
    try {
        trackId = await OrdersModel.findOne({ trackingId: perfectOrderTrackingId });
    } catch (err) {
        return next(new HttpError('Creating Order failed', 500))
    }
    if (trackId) {
        return next(new HttpError('Same Id existed, Please refresh and try again', 404))
    }

    const createdOrders = new OrdersModel({
        OrderType,
        OrderAmount,
        CustomerName,
        DeliveryCity,
        PickupCity,

        fragility,
        weight,

        OrderDate,
        RiderAssignedDate: "",
        RiderDeliveredDate: "",

        CustomerContactNo,
        DeliveryAddress,
        PickupAddress,
        Items,
        status: "order - placed",
        creator: creatorId,
        creatorName,
        ridersId: "",

        ridersIdForPickup: "",
        ridersIdForDelivery: "",
        ridersIdForReturn: "",

        cancelReasons: "",

        trackingId: perfectOrderTrackingId,
        returnAttempt: "",
        accountsStatus: "",
    })

    //creating orders & adding it to a user
    let user;
    try {
        user = await UserModel.findById(creatorId);
    } catch (err) {
        return next(new HttpError('Creating Order failed', 500))
    }
    if (!user) {
        return next(new HttpError('Could not find user for provided Id', 404))
    }

    //if user exist then we store or create that new document with our new order and second we can we can add the orderId to the corresponding user
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await createdOrders.save({ session: sess })
        user.orders.push(createdOrders)
        await user.save({ session: sess })
        await sess.commitTransaction() //if all above tasks completed then session comes to end and if error in any one then catch error
    } catch (err) {
        return next(new HttpError("Could not Create order", 500));
    }
    return res.json(createdOrders)
}


const createVendorOrders = async (req, res, next) => {
    const { OrderType, OrderAmount, CustomerName, DeliveryCity, PickupCity, OrderDate, CustomerContactNo, DeliveryAddress, PickupAddress, Items, fragility, weight } = req.body;
    
    let creatorId = req.params.vid;
    let creatorName = req.params.vendorName;

    const perfectOrderTrackingId = `mgc-${new Date(OrderDate).getTime().toString().slice(-9)}${parseInt(Math.random() * 10)}${CustomerContactNo.slice(-4)}`

    let trackId;
    try {
        trackId = await OrdersModel.findOne({ trackingId: perfectOrderTrackingId });
    } catch (err) {
        return next(new HttpError('Creating Order failed', 500))
    }
    if (trackId) {
        return next(new HttpError('Same Id existed, Please refresh and try again', 404))
    }

    const createdOrders = new OrdersModel({
        OrderType,
        OrderAmount,
        CustomerName,
        DeliveryCity,
        PickupCity,

        fragility,
        weight,

        OrderDate,
        RiderAssignedDate: "",
        RiderDeliveredDate: "",

        CustomerContactNo,
        DeliveryAddress,
        PickupAddress,
        Items,
        status: "order - placed",
        creator: creatorId,
        creatorName,
        ridersId: "",

        ridersIdForPickup: "",
        ridersIdForDelivery: "",
        ridersIdForReturn: "",

        cancelReasons: "",

        trackingId: perfectOrderTrackingId,
        returnAttempt: "",
        accountsStatus: "",
    })

    //creating orders & adding it to a user
    let user;
    try {
        user = await UserModel.findById(creatorId);
    } catch (err) {
        return next(new HttpError('Creating Order failed', 500))
    }
    if (!user) {
        return next(new HttpError('Could not find user for provided Id', 404))
    }

    //if user exist then we store or create that new document with our new order and second we can we can add the orderId to the corresponding user
    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await createdOrders.save({ session: sess })
        user.orders.push(createdOrders)
        await user.save({ session: sess })
        await sess.commitTransaction() //if all above tasks completed then session comes to end and if error in any one then catch error
    } catch (err) {
        return next(new HttpError("Could not Create order", 500));
    }
    return res.json(createdOrders)
}


//GETTING DATA
const getOrders = async (req, res, next) => {
    try {
        const orders = await OrdersModel.find({ status: 'Shipment - Booked' })
        res.json(orders)
    }
    catch (err) {
        return next(new HttpError("Could not Get orders", 500));
    }
}

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await OrdersModel.find()
        res.json(orders)
    }
    catch (err) {
        return next(new HttpError('could not get all orders', 500))
    }
}

const getOrdersByStatusOrdersAtWarehouse = async (req, res, next) => {
    try {
        const orders = await OrdersModel.find({ status: { $in: ["At Warehouse - Rider Picked", "At Warehouse - Receiver Cancelled"] } })
        res.json(orders)
    }
    catch (err) {
        return next(new HttpError("Could not Get orders", 500));
    }
}

const getOrdersByStatusCancelledByVendor = async (req, res, next) => {
    try {
        const orders = await OrdersModel.find({ status: 'Shipment - Cancelled By Vendor' })
        res.json(orders)
    }
    catch (err) {
        return next(new HttpError("Could not Get orders", 500));
    }
}

const getOrdersByStatusOrdersToReturn = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        const token = authHeader.split(' ')[1];
        let ridersId;
        try {
            const decoded = jwt.verify(token, "super-duper-hassan-secret-dont-share");
            ridersId = decoded.ridersId;
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
        const orderById = await OrdersModel.find({ ridersId: ridersId, status: "Rider Assigned - To Return To Vendor" })
        if (!orderById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderById })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

const getOrdersByStatusOrdersToDeliver = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        const token = authHeader.split(' ')[1];
        let ridersId;
        try {
            const decoded = jwt.verify(token, "super-duper-hassan-secret-dont-share");
            ridersId = decoded.ridersId;
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
        const orderById = await OrdersModel.find({ ridersId: ridersId, status: "Return - Rider Assigned To Deliver" })
        if (!orderById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderById })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}


//GETTING DATA BY Token for user whose orders should be shown
const getOrdersByToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        const token = authHeader.split(' ')[1];
        let creatorId;
        try {
            const decoded = jwt.verify(token, "super-duper-hassan-secret-dont-share");
            creatorId = decoded.userId;
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
        const orderById = await OrdersModel.find({ creator: creatorId })
        if (!orderById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderById })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}


// Getting Data by status assigned
const getOrdersByStatusRiderAssignedToPickup = async (req, res, next) => {
    try {
        const order = await OrdersModel.find({ status: "Shipment - Rider Assigned To Pick" })
        return res.json(order)
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

const getOrdersByStatusOrdersWithRider = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        const token = authHeader.split(' ')[1];
        let ridersId;
        try {
            const decoded = jwt.verify(token, "super-duper-hassan-secret-dont-share");
            ridersId = decoded.ridersId;
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }

        const order = await OrdersModel.find({ ridersId: ridersId, status: { $in: ["Shipment - Rider Picked", "Return - Cancelled By Receiver"] } })
        return res.json(order)
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}
const getOrdersByStatusOrdersWithRiderScanAtWarehouse = async (req, res, next) => {
    try {
        const order = await OrdersModel.find({ status: { $in: ["Shipment - Rider Picked", "Return - Cancelled By Receiver"] } })
        return res.json(order)
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

const getOrdersByStatusRiderAssignedToPickupForRiderIdToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        const token = authHeader.split(' ')[1];
        let ridersId;
        try {
            const decoded = jwt.verify(token, "super-duper-hassan-secret-dont-share");
            ridersId = decoded.ridersId;
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
        const orderByRidersId = await OrdersModel.find({ ridersId: ridersId, status: "Shipment - Rider Assigned To Pick" })
        if (!orderByRidersId) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderByRidersId })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}


//GETTING DATA BY ID
const getOrdersById = async (req, res, next) => {
    try {
        const orderId = req.params.pid;
        const orderById = await OrdersModel.findById(orderId)
        if (!orderById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderById.toObject({ getters: true }) })  //Ye isliye hota hai kyun ke Mongoose ek virtual getter rakhta hai jo _id ko id bana deta hai.
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

const getOrdersByTrackingId = async (req, res, next) => {
    try {
        const orderTrId = req.params.pid;
        const orderById = await OrdersModel.findOne({ trackingId: orderTrId })
        if (!orderById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderById })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

const getOrdersByStatusOrdersRiderDelivered = async (req, res, next) => {
    try {
        const orderById = await OrdersModel.find({ status: "Return - Rider Delivered" })
        if (!orderById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderById })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

//GETTING DATA BY USER ID
const getOrdersByUserId = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const orderById = await OrdersModel.find({ creator: userId })
        if (!orderById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderById })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

const getVendorOrdersByUserId = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const orderById = await OrdersModel.find({ creator: userId })
        if (!orderById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ order: orderById })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

const getOrdersByRiderId = async (req, res, next) => {
    try {
        const riderId = req.params.rid;
        const orders = await OrdersModel.find({ ridersId: riderId })

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                success: true,
                orders: [],
                count: 0
            });
        }
        return res.status(200).json(orders);
    } catch (err) {
        console.error('Get orders by rider error:', err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const getOrdersForPickupByRiderId = async (req, res, next) => {
    try {
        const riderId = req.params.rid;
        const ordersForPickup = await OrdersModel.find({ ridersIdForPickup: riderId }) || [];
        if (!ordersForPickup || ordersForPickup.length === 0) {
            return res.status(200).json({
                success: true,
                orders: [],
                count: 0
            });
        }
        return res.status(200).json({ orders: ordersForPickup });
    } catch (err) {
        console.error('Get orders error:', err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const getOrdersForDeliveryByRiderId = async (req, res, next) => {
    try {
        const riderId = req.params.rid;
        const ordersForDelivery = await OrdersModel.find({ ridersIdForDelivery: riderId }) || [];
        if (!ordersForDelivery || ordersForDelivery.length === 0) {
            return res.status(200).json({
                success: true,
                orders: [],
                count: 0
            });
        }
        return res.status(200).json({ orders: ordersForDelivery });
    } catch (err) {
        console.error('Get orders error:', err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const getOrdersForReturnByRiderId = async (req, res, next) => {
    try {
        const riderId = req.params.rid;
        const ordersForReturn = await OrdersModel.find({ ridersIdForReturn: riderId }) || [];
        if (!ordersForReturn || ordersForReturn.length === 0) {
            return res.status(200).json({
                success: true,
                orders: [],
                count: 0
            });
        }
        return res.status(200).json({ orders: ordersForReturn });
    } catch (err) {
        console.error('Get orders error:', err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Update for returned Orders
const updateReturnOrdersById = async (req, res, next) => {
    const { status, cancelReasons } = req.body;
    const orderId = req.params.pid;
    let order;
    try {
        order = await OrdersModel.findById(orderId);
        if (!order) {
            return next(new HttpError("Order not found", 404));
        }

        if (status) order.status = status;
        if (cancelReasons) order.cancelReasons = cancelReasons;
        // FIXED with switch
        switch (order.returnAttempt) {
            case "":
                order.returnAttempt = "1";
                break;
            case "1":
                order.returnAttempt = "2";
                break;
            case "2":
                order.returnAttempt = "3";
                break;
            case "3":
                order.returnAttempt = "4";
                break;
            default:
                break;
        }
        await order.save();
    }
    catch (err) {
        return next(new HttpError("Could not update order", 500));
    }
    return res.status(200).json({ order })
}


//TO UPDATE FOR PATCH MEANS UPDATE WHICH IS SEND
const updateOrdersById = async (req, res, next) => {
    const { ridersIdForPickup, ridersIdForDelivery, ridersIdForReturn, status, ridersId, RiderAssignedDate, RiderDeliveredDate, accountsStatus } = req.body;
    const orderId = req.params.pid;
    let order;
    try {
        order = await OrdersModel.findById(orderId);
        if (!order) {
            return next(new HttpError("Order not found", 404));
        }

        if (ridersIdForPickup) order.ridersIdForPickup = ridersIdForPickup;
        if (ridersIdForDelivery) order.ridersIdForDelivery = ridersIdForDelivery;
        if (ridersIdForReturn) order.ridersIdForReturn = ridersIdForReturn;

        if (RiderAssignedDate) order.RiderAssignedDate = RiderAssignedDate;
        if (RiderDeliveredDate) order.RiderDeliveredDate = RiderDeliveredDate;
        if (status) order.status = status;
        if (ridersId) order.ridersId = ridersId;
        if (accountsStatus) order.accountsStatus = accountsStatus;
        await order.save();

        // ADD SOCKET.IO EMISSION HERE
        const io = req.app.get('socketio');
        if (io && status) {
            if (status === "Shipment - Booked") {
                io.emit('order-updated', {
                    status: status,
                });
            }

            if (ridersIdForPickup && (status === "Shipment - Rider Assigned To Pick")) {
                io.to(`rider-${ridersIdForPickup}`).emit('rider-assigned-order-pickup', {
                    status: status,
                });
            }
            if (ridersIdForDelivery && (status === "Return - Rider Assigned To Deliver")) {
                io.to(`rider-${ridersIdForDelivery}`).emit('rider-assigned-order-delivery', {
                    status: status,
                });
            }
            if (ridersIdForReturn && (status === "Rider Assigned - To Return To Vendor")) {
                io.to(`rider-${ridersIdForReturn}`).emit('rider-assigned-order-return', {
                    status: status,
                });
            }
        }

    }
    catch (err) {
        return next(new HttpError("Could not update order", 500));
    }
    return res.status(200).json({ order })
}

//TO DELETE
const deleteOrdersById = async (req, res, next) => {
    const orderId = req.params.pid;
    let order;
    try {
        order = await OrdersModel.findById(orderId).populate('creator')
        //using populate method hence we now want to delete the id also from the user. this means we need access to overwrite or change an existing information in this document 
        //populate allow us to refer to a document stored in another collection and to work with data in that existing document of that other collection to do so we need a relation b/w these documents which is existing in model schemas using ref 
    } catch (err) {
        return next(new HttpError('place not found', 404))
    }

    if (!order) {
        return next(new HttpError('Could not found order for this id', 404))
    }

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await order.deleteOne({ session: sess })
        order.creator.orders.pull(order)  //hence we had populated creator data in order, so we can access creator user data and and can manipulate it
        await order.creator.save({ session: sess })
        await sess.commitTransaction()
    } catch (err) {
        return next(new HttpError('Could not delete', 500))
    }
    return res.status(200).json({ message: "Order deleted successfully" })
}

exports.deleteOrdersById = deleteOrdersById;
exports.updateOrdersById = updateOrdersById;
exports.createOrders = createOrders;
exports.getOrders = getOrders;
exports.getAllOrders = getAllOrders;
exports.getOrdersById = getOrdersById;
exports.getOrdersByUserId = getOrdersByUserId;
exports.getOrdersByToken = getOrdersByToken;
exports.getOrdersByStatusRiderAssignedToPickup = getOrdersByStatusRiderAssignedToPickup;
exports.getOrdersByStatusRiderAssignedToPickupForRiderIdToken = getOrdersByStatusRiderAssignedToPickupForRiderIdToken;
exports.getOrdersByStatusOrdersWithRider = getOrdersByStatusOrdersWithRider;
exports.getOrdersByStatusOrdersAtWarehouse = getOrdersByStatusOrdersAtWarehouse;
exports.getOrdersByStatusCancelledByVendor = getOrdersByStatusCancelledByVendor;
exports.getOrdersByRiderId = getOrdersByRiderId;
exports.getOrdersByStatusOrdersWithRiderScanAtWarehouse = getOrdersByStatusOrdersWithRiderScanAtWarehouse;
exports.getOrdersByStatusOrdersToReturn = getOrdersByStatusOrdersToReturn;
exports.getOrdersByStatusOrdersToDeliver = getOrdersByStatusOrdersToDeliver;
exports.getOrdersByTrackingId = getOrdersByTrackingId;
exports.updateReturnOrdersById = updateReturnOrdersById;
exports.getOrdersByStatusOrdersRiderDelivered = getOrdersByStatusOrdersRiderDelivered;

exports.authenticateVendorToken = authenticateVendorToken;
exports.getVendorOrdersByUserId = getVendorOrdersByUserId;
exports.createVendorOrders = createVendorOrders;

exports.getOrdersForPickupByRiderId = getOrdersForPickupByRiderId;
exports.getOrdersForDeliveryByRiderId = getOrdersForDeliveryByRiderId;
exports.getOrdersForReturnByRiderId = getOrdersForReturnByRiderId;

exports.authenticateAdminAndRiderToken = authenticateAdminAndRiderToken;
exports.authenticateApprovedUserToken = authenticateApprovedUserToken;
exports.authenticateAdminAndRiderAndApprovedandVendorToken = authenticateAdminAndRiderAndApprovedandVendorToken;

//Use simple .find() with .select()
//✅ Use .limit() for pagination
//✅ Use .sort() for ordering