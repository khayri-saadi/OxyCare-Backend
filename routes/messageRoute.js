var express = require('express');
const message = require('../controllers/messageController')
const userAutho = require('../controllers/Userauthentification')
var router = express.Router({mergeParams:true});

router.use(userAutho.protect)
router.route('/')
.post(userAutho.restrictTo('user','doctor'),message.createMsg)
.get(userAutho.restrictTo('user','doctor'),message.getdiscussion)



router.use(userAutho.restrictTo('admin'))


router.route('/All')
.get(message.getAllMsg)



router.route('/:id')
.get(message.getOneMessage)
.delete(message.deleteMessage)
.patch(message.updateMessage)

module.exports = router;
