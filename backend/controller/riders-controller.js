const UserModel = require('../models/user-model')
const HttpError = require('../models/http-error');
const OrdersModel = require('../models/orders-model');

const RidersModel = require('../models/riders-model');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken')

// BCRYPT
const bcrypt = require('bcrypt')
//CREATING DATA
const signup = async (req, res, next) => {
    try {
        const { ridersName, contactNo, emailAddress, vehicle, licenseNo, assignedArea, password, cnic } = req.body;
        //cnicCopyImage will be handle soon
        const existingRiders = await RidersModel.findOne({ emailAddress });
        if (existingRiders) {
            return next(new HttpError("Email already exists", 422));
        }
        // BCRYPT
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12)
        } catch (err) {
            return next(new HttpError('Could not create riders', 500))
        }
        const createdRiders = new RidersModel({
            ridersName,
            contactNo,
            emailAddress,
            vehicle,
            licenseNo,
            assignedArea,
            cnic,
            password: hashedPassword,
            orders: [],
            status: "rider",
        })
        await createdRiders.save()

        let token;
        try {
            token = jwt.sign(
                { status: createdRiders.status, ridersId: createdRiders._id, emailAddress: createdRiders.emailAddress, Name: createdRiders.ridersName },
                'super-duper-hassan-secret-dont-share',
                { expiresIn: '12h' }
            )
        } catch (err) {
            return next(new HttpError('Could not create Rider'))
        }

        return res.json({ token, message: "rider" })
    } catch (err) {
        return next(new HttpError("Could not Create rider", 500));
    }
}

const authenticateRiderToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, "super-duper-hassan-secret-dont-share")
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new HttpError('Token Expired', 401))
            }
            return next(new HttpError('Invalid Token'), 403)
        }

        const rider = await RidersModel.findById(decoded.ridersId);

        if (!rider) {
            return next(new HttpError('Rider account not found', 403))
        }

        next();
    }
    catch (err) {
        return next(new HttpError('Rider Auth Error', 500))
    }
};

//GETTING DATA
const getRiders = async (req, res, next) => {
    try {
        const riders = await RidersModel.find()
        res.json(riders)
    }
    catch (err) {
        return next(new HttpError("Could not Get rider", 500));
    }
}

//GETTING DATA BY ID
const getRidersById = async (req, res, next) => {
    try {
        const ridersId = req.params.rid;
        const ridersById = await RidersModel.findById(ridersId)
        if (!ridersById) {
            return next(new HttpError("Riders not found", 404));
        }
        return res.status(200).json({ riders: ridersById })
    } catch (err) {
        return next(new HttpError("Could not Get riders", 500));
    }
}

const getRidersByToken = async (req, res, next) => {
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
        const ridersById = await RidersModel.findById(ridersId)
        if (!ridersById) {
            return next(new HttpError("Order not found", 404));
        }
        return res.status(200).json({ ridersById })
    } catch (err) {
        return next(new HttpError("Could not Get order", 500));
    }
}

// const getUnapprovedRiders = async (req, res, next) => {
//     try {
//         const ridersById = await RidersModel.find({ status: "" })
//         if (!ridersById) {
//             return next(new HttpError("Riders not found", 404));
//         }
//         return res.status(200).json({ riders: ridersById })
//     } catch (err) {
//         return next(new HttpError("Could not Get Riders", 500));
//     }
// }

//TO UPDATE FOR PATCH MEANS UPDATE WHICH IS SEND
const updateRidersById = async (req, res, next) => {
    const { ridersName, emailAddress, password } = req.body;
    const ridersId = req.params.rid;
    let riders;
    try {
        riders = await RidersModel.findById(ridersId);
        if (!riders) {
            return next(new HttpError("Riders not found", 404));
        }
        if (ridersName) riders.ridersName = ridersName;
        if (emailAddress) riders.emailAddress = emailAddress;
        if (password) riders.password = password;
        await riders.save();
    }
    catch (err) {
        return next(new HttpError("Could not update Rider", 500));
    }
    return res.status(200).json({ riders })
}

//TO DELETE
const deleteRidersById = async (req, res, next) => {
    const ridersId = req.params.rid;
    let riders;
    try {
        riders = await RidersModel.findById(ridersId)
        await riders.deleteOne()
    } catch (err) {
        return next(new HttpError('rider not found', 404))
    }
    if (!riders) {
        return next(new HttpError('Could not found riders for this id', 404))
    }
    return res.status(200).json({ message: "Riders deleted successfully" })
}


exports.authenticateRiderToken = authenticateRiderToken;

exports.deleteRidersById = deleteRidersById;
exports.updateRidersById = updateRidersById;

exports.signup = signup;
exports.getRiders = getRiders;
exports.getRidersById = getRidersById;
exports.getRidersByToken = getRidersByToken;