const express = require('express')
const router = express.Router()

const userController = require('../controller/users-controller')

router.get('/', userController.authenticateAdminToken, userController.getUser)
router.get('/unapproved', userController.authenticateAdminToken, userController.getUnapprovedUser)
router.get('/approved', userController.authenticateAdminToken, userController.getApprovedUser)

router.post('/signup', userController.signup)

router.post('/signup-vendor', userController.authenticateAdminToken, userController.signupVendor)
router.get('/vendor', userController.authenticateAdminToken, userController.getVendor)

router.post('/login', userController.login)

router.get('/:uid', userController.authenticateAdminToken, userController.getUserById)
router.patch('/:uid', userController.authenticateAdminToken, userController.updateUserById)
router.delete('/:uid', userController.authenticateAdminToken, userController.deleteUserById)

module.exports = router;