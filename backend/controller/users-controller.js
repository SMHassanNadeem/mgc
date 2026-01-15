const UserModel = require('../models/user-model')
const HttpError = require('../models/http-error');
const OrdersModel = require('../models/orders-model');
const RidersModel = require('../models/riders-model');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken')

// BCRYPT
const bcrypt = require('bcrypt');
//CREATING DATA
const signup = async (req, res, next) => {
    try {
        const {status, CompanyName, PhoneNo, PickupAddress, Cnic, personOfContact, Email, BankName, AccNo, BranchCode, IBAN, AccTitle, BranchName, SwiftCode, password } = req.body;
        //cnicCopyImage will be handle soon
        const existingUser = await UserModel.findOne({ Email });
        if (existingUser) {
            return next(new HttpError("Email already exists", 422));
        }
        // BCRYPT
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12)  //its first param is the input we get from frontend and second is called salt and it tells how hard should be the hashing to dcrypt
        } catch (err) {
            return next(new HttpError('Could not create user', 500))
        }
        const createdUser = new UserModel({
            CompanyName,
            PhoneNo,
            PickupAddress,
            Cnic,
            personOfContact,
            Email,
            BankName,
            AccNo,
            BranchCode,
            IBAN,
            AccTitle,
            BranchName,
            SwiftCode,
            password: hashedPassword,  //now storing hashed password
            // image,
            orders: [], // to add relation b/w user and place and one user can have multiple places so I want to add places dynamically instead of overwritting here
            status: "",
        })
        await createdUser.save()

        let token;
        try {
            token = jwt.sign(
                { status: createdUser.status, userId: createdUser._id, Email: createdUser.Email, Name: createdUser.CompanyName },  //data should be send through token
                'super-duper-hassan-secret-dont-share',   //token key and without it data in token will not be unlock
                { expiresIn: '360h' }       //it is necessary because even if the token get compromise then still it will be valid after 360h
            )
        } catch (err) {
            return next(new HttpError('Could not create User'))
        }

        const io = req.app.get('socketio');
        if (io) {
            // Emit to all connected clients
            io.emit('user-added', {
                notif:"new unapproved user"
            });
        }

        return res.json({ token, message: "Admin will accept your account soon !" })
    } catch (err) {
        return next(new HttpError("Could not Create user", 500));
    }
}


const signupVendor = async (req, res, next) => {
    try {
        const {CompanyName, PhoneNo, PickupAddress, Cnic, personOfContact, Email, BankName, AccNo, BranchCode, IBAN, AccTitle, BranchName, SwiftCode, password } = req.body;
        //cnicCopyImage will be handle soon
        const existingUser = await UserModel.findOne({ Email });
        if (existingUser) {
            return next(new HttpError("Email already exists", 422));
        }
        // BCRYPT
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12)  //its first param is the input we get from frontend and second is called salt and it tells how hard should be the hashing to dcrypt
        } catch (err) {
            return next(new HttpError('Could not create user', 500))
        }
        const createdUser = new UserModel({
            CompanyName,
            PhoneNo,
            PickupAddress,
            Cnic,
            personOfContact,
            Email,
            BankName,
            AccNo,
            BranchCode,
            IBAN,
            AccTitle,
            BranchName,
            SwiftCode,
            password: hashedPassword,  //now storing hashed password
            // image,
            orders: [], // to add relation b/w user and place and one user can have multiple places so I want to add places dynamically instead of overwritting here
            status: "vendor",
        })
        await createdUser.save()

        let token;
        try {
            token = jwt.sign(
                { status: createdUser.status, userId: createdUser._id, Email: createdUser.Email, Name: createdUser.CompanyName },  //data should be send through token
                'super-duper-hassan-secret-dont-share',   //token key and without it data in token will not be unlock
                { expiresIn: '360h' }       //it is necessary because even if the token get compromise then still it will be valid after 12h
            )
        } catch (err) {
            return next(new HttpError('Could not create User'))
        }

        return res.json({ token, message: "added vendor" })
    } catch (err) {
        return next(new HttpError("Could not Create user", 500));
    }
}


//LOGIN
const login = async (req, res, next) => {
    try {
        const { Email, password } = req.body;

        const foundUser = await UserModel.findOne({ Email: Email })

        if (foundUser) {
            const authenticatedUser = await bcrypt.compare(password, foundUser.password);
            if (!authenticatedUser) {
                return next(new HttpError('Wrong Credentials', 401))
            }
            let token;
            try {
                token = jwt.sign(
                    { status: foundUser.status, userId: foundUser._id, Email: foundUser.Email, Name: foundUser.CompanyName },  //data should be send through token
                    'super-duper-hassan-secret-dont-share',   //token key and without it data in token will not be unlock
                    { expiresIn: '360h' }       //it is necessary because even if the token get compromise then still it will be valid after 12h
                )
            } catch (err) {
                return next(new HttpError('Could not login User'))
            }
            if (foundUser.status === "") {
                return res.status(200).json({ message: "Not Approved yet", token })
            }
            if (foundUser.status === "admin") {
                return res.status(200).json({ message: "admin", token })
            }
            if (foundUser.status === "approved") {
                return res.status(200).json({ message: "approved", token })
            }
            if (foundUser.status === "vendor") {
                return res.status(200).json({ message: "vendor", token })
            }
        }

        const foundRider = await RidersModel.findOne({ emailAddress: Email })
        if (foundRider) {
            const authenticatedUser = await bcrypt.compare(password, foundRider.password);
            if (!authenticatedUser) {
                return next(new HttpError('Wrong Credentials', 401))
            }
            let token;
            try {
                token = jwt.sign(
                    { ridersId: foundRider._id, Email: foundRider.emailAddress, Name: foundRider.ridersName },  //data should be send through token
                    'super-duper-hassan-secret-dont-share',   //token key and without it data in token will not be unlock
                    { expiresIn: '360h' }       //it is necessary because even if the token get compromise then still it will be valid after 12h
                )
            } catch (err) {
                return next(new HttpError('Could not authenticate Rider'))
            }
            return res.status(200).json({ message: "rider", token })
        }

        res.status(200).json({ message: "User is Authenticated", token })
    }
    catch (err) {
        return next(new HttpError("Login failed", 500));
    }
}

const authenticateAdminToken = (req, res, next) => {
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

        if (req.user.status !== "admin") {
            return next(new HttpError('Only Admin is authenticated', 403))
        }
        next();
    });
};

//GETTING DATA
const getUser = async (req, res, next) => {
    try {
        const users = await UserModel.find()
        res.json(users)
    }
    catch (err) {
        return next(new HttpError("Could not Get user", 500));
    }
}

const getVendor = async (req, res, next) => {
    try {
        const users = await UserModel.find({status: "vendor"})
        res.json(users)
    }
    catch (err) {
        return next(new HttpError("Could not Get user", 500));
    }
}

//GETTING DATA BY ID
const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const userById = await UserModel.findById(userId)
        if (!userById) {
            return next(new HttpError("User not found", 404));
        }
        return res.status(200).json({ user: userById })
    } catch (err) {
        return next(new HttpError("Could not Get User", 500));
    }
}

const getUnapprovedUser = async (req, res, next) => {
    try {
        const userById = await UserModel.find({ status: "" })
        if (!userById) {
            return next(new HttpError("User not found", 404));
        }
        return res.status(200).json({ user: userById })
    } catch (err) {
        return next(new HttpError("Could not Get User", 500));
    }
}
const getApprovedUser = async (req, res, next) => {
    try {
        const userById = await UserModel.find({ status: "approved" })
        if (!userById) {
            return next(new HttpError("User not found", 404));
        }
        return res.status(200).json({ user: userById })
    } catch (err) {
        return next(new HttpError("Could not Get User", 500));
    }
}

//TO UPDATE FOR PATCH MEANS UPDATE WHICH IS SEND
const updateUserById = async (req, res, next) => {
    const { CompanyName, Email, password, status } = req.body;
    const userId = req.params.uid;
    let user;
    try {
        user = await UserModel.findById(userId);
        if (!user) {
            return next(new HttpError("User not found", 404));
        }
        if (status) user.status = status;
        if (CompanyName) user.CompanyName = CompanyName;
        if (Email) user.Email = Email;
        if (password) user.password = password;
        await user.save();
    }
    catch (err) {
        return next(new HttpError("Could not update User", 500));
    }
    return res.status(200).json({ user })
}

//TO DELETE
const deleteUserById = async (req, res, next) => {
    const userId = req.params.uid;
    let user;
    try {
        user = await UserModel.findById(userId).populate('orders')
    } catch (err) {
        return next(new HttpError('user not found', 404))
    }

    if (!user) {
        return next(new HttpError('Could not found user for this id', 404))
    }

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()

        await UserModel.deleteMany({ creator: userId }, { session: sess });
        //hence we had populated creator data in place, so we can access creator user data and and can manipulate it

        await user.deleteOne({ session: sess })

        await sess.commitTransaction()
    } catch (err) {
        return next(new HttpError('Could not delete', 500))
    }
    return res.status(200).json({ message: "User deleted successfully" })
}


exports.authenticateAdminToken = authenticateAdminToken;

exports.deleteUserById = deleteUserById;
exports.updateUserById = updateUserById;

exports.signup = signup;

exports.signupVendor = signupVendor;
exports.getVendor = getVendor;

exports.login = login;
exports.getUser = getUser;
exports.getApprovedUser = getApprovedUser;
exports.getUnapprovedUser = getUnapprovedUser;
exports.getUserById = getUserById;