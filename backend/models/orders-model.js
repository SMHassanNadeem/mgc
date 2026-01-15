const mongoose = require('mongoose')

const ordersSchema = new mongoose.Schema({
    OrderType: { type: String, required: true },
    OrderAmount: { type: Number, required: true },
    CustomerName: { type: String, required: true },
    DeliveryCity: { type: String, required: true },
    PickupCity: { type: String, required: true },

    fragility: { type: String, required: true },
    weight: { type: Number, required: true },

    OrderDate: { type: String, required: true },
    RiderAssignedDate: { type: String, required: false },
    RiderDeliveredDate: { type: String, required: false },

    CustomerContactNo: { type: Number, required: true },
    DeliveryAddress: { type: String, required: true },
    PickupAddress: { type: String, required: true },
    status: { type: String, required: true },
    Items: { type: Number, required: true },
    creatorName: { type: String, required: true },
    ridersId: { type: String, required: false },

    ridersIdForPickup: { type: String, required: false },
    ridersIdForDelivery: { type: String, required: false },
    ridersIdForReturn: { type: String, required: false },

    trackingId: { type: String, required: true },
    returnAttempt: { type: String, required: false },

    accountsStatus: { type: String, required: false },

    cancelReasons: { type: String, required: false },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'UserModel' }, // ref: 'UserModel'
})

module.exports = mongoose.model('OrdersModel', ordersSchema)