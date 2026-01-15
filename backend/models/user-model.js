const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    CompanyName: { type: String, required: true },
    PhoneNo: { type: Number, required: true },
    PickupAddress: { type: String, required: true },
    // cnicCopyImage: "",
    Cnic: { type: Number, required: true },
    personOfContact: { type: String, required: true },
    Email: { type: String, required: true },
    BankName: { type: String, required: true },
    AccNo: { type: Number, required: true },
    BranchCode: { type: String, required: true },
    IBAN: { type: Number, required: true },
    AccTitle: { type: String, required: true },
    BranchName: { type: String, required: true },
    SwiftCode: { type: Number, required: true },
    password: { type: String, required: true}, //minlength: 6 
    orders:[{ type: mongoose.Types.ObjectId, ref: 'OrdersModel' }], // to add relation b/w user and place and ref is to connect with other collection and array to allow array
    status:{ type: String, required: false},
})

module.exports = mongoose.model('UserModel', userSchema)