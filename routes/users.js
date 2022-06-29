var express = require('express');
var router = express.Router();
const authoUser = require('../controllers/Userauthentification')
const userController = require('../controllers/userController')
const messageRouter = require('./messageRoute')

router.use('/:id/msg',messageRouter)



router.route('/forgotPass').post(authoUser.forgotPassword)
router.route('/signup').post(authoUser.signup)
router.route('/login').post(authoUser.login)


router.use(authoUser.protect)


router.route('/Logout').get(authoUser.logout)
router.route('/getMe').get(authoUser.getMe)
router.route('/changePass').post(authoUser.updatePassword)
router.route('/updateMe').post(authoUser.updateMe)
router.route('/reset-pass/:token').patch(authoUser.resetPassword)
router.route('/')
.get(authoUser.restrictTo('doctor','user'),userController.getusers)


router.use(authoUser.restrictTo('admin'))



router.route('/getALL').get(userController.getALL)
.post(authoUser.restrictTo('admin'),userController.addUser)
router.route('/:id')
.patch(userController.updateUser)
.delete(userController.deleteUser)
.get(userController.getOneuser)


module.exports = router;
