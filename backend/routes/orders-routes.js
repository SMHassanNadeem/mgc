const express = require('express')
const router = express.Router();

const ordersControllers = require('../controller/orders-controller')
const RidersController = require('../controller/riders-controller')
router.post('/', ordersControllers.authenticateApprovedUserToken, ordersControllers.createOrders)

router.post('/vendor', ordersControllers.authenticateVendorToken, ordersControllers.createOrders)

const userControllers = require('../controller/users-controller')

router.post('/admin/vendor/:vid/:vendorName', userControllers.authenticateAdminToken, ordersControllers.createVendorOrders)

//For Third Party
router.post('/tp-vendor/:vid/:vendorName/:token', ordersControllers.authenticateThirdPartyToken, ordersControllers.createVendorOrders)

router.get('/get-all-orders', userControllers.authenticateAdminToken, ordersControllers.getAllOrders)
router.get('/', userControllers.authenticateAdminToken, ordersControllers.getOrders)

router.get('/assigned-to-rider-to-pickup', userControllers.authenticateAdminToken, ordersControllers.getOrdersByStatusRiderAssignedToPickup)
router.get('/assigned-to-rider-to-pickup-auth-rider', RidersController.authenticateRiderToken, ordersControllers.getOrdersByStatusRiderAssignedToPickupForRiderIdToken)

router.get('/orders-with-rider', ordersControllers.authenticateAdminAndRiderToken, ordersControllers.getOrdersByStatusOrdersWithRider)

router.get('/orders-with-rider-scan-at-warehouse', userControllers.authenticateAdminToken, ordersControllers.getOrdersByStatusOrdersWithRiderScanAtWarehouse)

router.get('/orders-assigned-deliver', RidersController.authenticateRiderToken, ordersControllers.getOrdersByStatusOrdersToDeliver)
router.get('/orders-assigned-return', RidersController.authenticateRiderToken, ordersControllers.getOrdersByStatusOrdersToReturn)

router.get('/orders-at-warehouse', userControllers.authenticateAdminToken, ordersControllers.getOrdersByStatusOrdersAtWarehouse)

router.get('/orders-rider-delivered', userControllers.authenticateAdminToken, ordersControllers.getOrdersByStatusOrdersRiderDelivered)

router.get('/orders-cancelled-by-vendor', userControllers.authenticateAdminToken, ordersControllers.getOrdersByStatusCancelledByVendor)

router.get('/order-data-of-user', ordersControllers.authenticateApprovedUserToken, ordersControllers.getOrdersByToken)


//loader
router.get('/loader-auth-check', ordersControllers.authenticateVendorAndApprovedUserToken, (req,res) => { res.json({dummy: "checking auth"}) } )


router.get('/order-data-of-vendor', ordersControllers.authenticateVendorToken, ordersControllers.getOrdersByToken)

router.get('/:pid', ordersControllers.authenticateApprovedUserToken, ordersControllers.getOrdersById)

router.get('/track/:pid', ordersControllers.getOrdersByTrackingId)

router.get('/rider/:rid', userControllers.authenticateAdminToken, ordersControllers.getOrdersByRiderId)

router.get('/rider/pickup/:rid', userControllers.authenticateAdminToken, ordersControllers.getOrdersForPickupByRiderId)
router.get('/rider/delivery/:rid', userControllers.authenticateAdminToken, ordersControllers.getOrdersForDeliveryByRiderId)
router.get('/rider/return/:rid', userControllers.authenticateAdminToken, ordersControllers.getOrdersForReturnByRiderId)

router.get('/user/:uid', ordersControllers.authenticateApprovedUserToken, ordersControllers.getOrdersByUserId)

router.get('/admin/user/:uid', userControllers.authenticateAdminToken, ordersControllers.getOrdersByUserId)

router.get('/admin/vendor/:uid', userControllers.authenticateAdminToken, ordersControllers.getVendorOrdersByUserId)

// const authCheck = require('../auth/check-auth')
// Now I want that only authenticated user can update and delete the place so,
// we are adding middleware to check it , before the routes to be protected
// router.use(authCheck)

router.patch('/:pid', ordersControllers.authenticateAdminAndRiderAndApprovedandVendorToken, ordersControllers.updateOrdersById)

router.patch('/return/:pid', ordersControllers.authenticateAdminAndRiderAndApprovedandVendorToken, ordersControllers.updateReturnOrdersById)

router.delete('/:pid', userControllers.authenticateAdminToken, ordersControllers.deleteOrdersById)

router.delete('/user/:pid', ordersControllers.authenticateApprovedUserToken, ordersControllers.deleteUserOrdersById)

router.delete('/vendor/:pid', ordersControllers.authenticateVendorToken, ordersControllers.deleteUserOrdersById)

module.exports = router;