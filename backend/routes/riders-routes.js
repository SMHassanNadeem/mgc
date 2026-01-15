const express = require('express')
const router = express.Router()

const ridersController = require('../controller/riders-controller')
const userController = require('../controller/users-controller')

router.get('/',userController.authenticateAdminToken, ridersController.getRiders)
router.get('/rider-own-data',ridersController.authenticateRiderToken, ridersController.getRidersByToken)

router.post('/signup',userController.authenticateAdminToken, ridersController.signup)
// router.post('/login', ridersController.login)

router.get('/:rid',userController.authenticateAdminToken, ridersController.getRidersById)
router.patch('/:rid',userController.authenticateAdminToken, ridersController.updateRidersById)
router.delete('/:rid',userController.authenticateAdminToken, ridersController.deleteRidersById)

module.exports = router;