const mongoose = require('mongoose')

const ridersSchema = new mongoose.Schema({
    ridersName: { type: String, required: true },
    contactNo: { type: Number, required: true },
    emailAddress: { type: String, required: true },
    vehicle: { type: String, required: true },
    licenseNo: { type: Number, required: true },
    assignedArea: { type: String, required: true },
    password: { type: String, required: true },
    cnic: { type: String, required: true },

    orders:[{ type: mongoose.Types.ObjectId, ref: 'OrdersModel', required: false }],
    status:{ type: String, required: false},
})

module.exports = mongoose.model('RidersModel', ridersSchema)