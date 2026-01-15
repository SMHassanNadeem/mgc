const express = require('express')
const bodyParser = require('body-parser')
const http = require('http') // ADD THIS
const { Server } = require('socket.io') // ADD THIS

const ordersRoute = require('./routes/orders-routes')
const usersRoute = require('./routes/users-routes')
const ridersRoute = require('./routes/riders-routes')
const HttpError = require('./models/http-error')

const app = express()

const server = http.createServer(app) // ADD THIS
// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        credentials: true
    }
})
// Make io accessible to routes
app.set('socketio', io) // ADD THIS

app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(bodyParser.json())

const mongoose = require('mongoose')
const url = require('./mongoose')

//CONNECTING
mongoose.connect(url).then(() => {
    console.log('Connected to db')
}).catch(() => {
    console.log('Not Connected to db')
})

app.use('/orders', ordersRoute)
app.use('/users', usersRoute)
app.use('/riders', ridersRoute)

app.use((req, res, next) => {
    const error = new HttpError('could not found route', 404)
    throw error;
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'unknown error occured' })
})


io.on('connection', (socket) => {
    // Get token from handshake
    const token = socket.handshake.auth.token;

    if (!token) {
        // console.log('No token provided');
        return;
    }

    try {
        const decoded = require('jsonwebtoken').verify(token, 'super-duper-hassan-secret-dont-share');
        const riderId = decoded.ridersId;
        const userId = decoded.userId;

        // Join room for this specific rider
        if (riderId) {
            socket.join(`rider-${riderId}`);
            // console.log(`Rider ${riderId} connected to their room`);
        }

        if (userId) {
            socket.join(`user-${userId}`);
            // console.log(`User ${userId} connected to their room`);
        }
    } catch (err) {
        // console.log('Invalid token for socket connection');
        socket.disconnect();
        return;
    }
    socket.on('disconnect', () => {
        // console.log('Client disconnected');
    });
});


//app.listen(3000)
server.listen(3000)






// const express = require('express')
// const bodyParser = require('body-parser')

// const ordersRoute = require('./routes/orders-routes')
// const usersRoute = require('./routes/users-routes')
// const ridersRoute = require('./routes/riders-routes')
// const HttpError = require('./models/http-error')

// const app = express()

// app.use((req, res, next) => {
//     const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
//     const origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//     }
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS'); // ADDED OPTIONS
//     res.setHeader('Access-Control-Allow-Credentials', 'true'); // ADD THIS
//     // Handle OPTIONS method (preflight requests)
//     if (req.method === 'OPTIONS') {
//         return res.sendStatus(200); // IMPORTANT: Return 200 for OPTIONS
//     }
//     next();
// });

// app.use(bodyParser.json())

// const mongoose = require('mongoose')
// const url = require('./mongoose')
// //CONNECTING
// mongoose.connect(url).then(() => {
//     console.log('Connected to db')
// }).catch(() => {
//     console.log('Not Connected to db')
// })

// app.use('/orders', ordersRoute)
// app.use('/users', usersRoute)
// app.use('/riders', ridersRoute)

// app.use((req, res, next) => {
//     const error = new HttpError('could not found route', 404)
//     throw error;
// })

// app.use((error, req, res, next) => {
//     if (res.headerSent) {
//         return next(error);
//     }
//     res.status(error.code || 500)
//     res.json({ message: error.message || 'unknown error occured' })
// })

// app.listen(3000)