const {promisify} = require('util')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const sendEmail = require('../utils/sendEmail')




const signToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{
       expiresIn : process.env.JWT_EXPIRES_IN
   })
}
const sendToken = (user,statusCode,res) => {
    const token =  signToken(user._id)
    const cookieOptions = {
        expires: new Date( Date.now() + process.env.JWT_EXPIRES_COOKIE_IN * 24 * 60 * 60 *1000),
        httpOnly : true,
    }
   console.log(process.env.JWT_EXPIRES_COOKIE_IN)
    res.cookie('token',token,cookieOptions)
    user.password = undefined,
    user.__v = undefined
     res.status(statusCode).json({
         status: 'success',
         user,
     })
 }
exports.signup = catchAsync(async(req,res,next)=> {
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        nom_Capteur : req.body.nom_Capteur,
        doctor: req.body.doctor
    })
    sendToken(newUser,200,res)
})


exports.login =  catchAsync( async (req,res,next)=> {
    const email = req.body.email
    const  password = req.body.password
    if(!email || !password) {
       return  next(new AppError('invalid email or password',400))
    }
    const user = await User.findOne({email : email}).select('+password')
    //console.log(user)
    if(!user || !await user.correctPassword(password,user.password)) {
        return next( new AppError('Incorrect email or password',401))
    }
    sendToken(user,200,res)
   })
exports.protect = catchAsync(async(req,res,next)=> {
    let  { token } = req.cookies
    if(!token) {
        return next( new AppError('you are not logged in , please log in to get access',401))
    }
    const decoded = await promisify(jwt.verify) (token,process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if(!user) {
        return next( new AppError('the user belonging to this token does no longer exist',401))
    }
    if(!user.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please,please log in again',401))
    }
    req.user = user
    next()
})

exports.logout = catchAsync(async(req,res,next)=> {
    res.cookie('token',null, {
        expires : new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        status : 'success',
        message : 'log out !!'
    })
})
exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError("You don't have permission to perform this action "))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async(req,res,next)=> {
    const user = await User.findOne({email: req.body.email})
    if(!user) {
        return next(new AppError('there is no user with this email',404))
    }
    const resetToken = user.sendRandomToken()
    //console.log(resetToken,'tokennnn')    //console.log(resetToken)
   const uss = await user.save({validateBeforeSave : false})
  // console.log(uss,'usserrr');
    const resetURL = `${req.protocol}://${req.get('host')}/users/reset-pass/${resetToken}`
   // console.log(resetURL ,'URRRL')
    const message  = `forgot your password ? submit a patch request with your new password  to : ${resetURL}\n if you didn't forget this password please 
    ignore this email`
    try {
        await sendEmail({
            email : req.body.email,
            subject : 'your password reset token (valid for 10 minutes)',
            message
        })
        res.status(200).json({
            status : 'success',
            message : 'Token send to email'
        })
       
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave : false})
    return next(new AppError('there was an error sending the email. Try again later !'),500)
   
    }
     

})
exports.resetPassword = catchAsync(async(req,res,next)=> {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ ResetpasswordToken : hashedToken, 
        passwordResetExpires : {$gt: Date.now()}})
        console.log(user,'user from resetPass')
    if(!user) {
        return next (new AppError('Token is invalid or has expired ',400))
    }
    if(req.body.password !== req.body.confirmPassword) {
        return next( new AppError('the passwords does not match'))
    }
    user.password = req.body.password,
    user.confirmPassword = req.body.confirmPassword
    user.ResetpasswordToken = undefined,
    user.passwordResetExpires = undefined
    await user.save()
    sendToken(user,200,res);
});



exports.getMe = catchAsync(async(req,res,next)=> {
    const currentuser = await User.findById(req.user.id)
    res.status(200).json({
        status:'success',
        data : {
            currentuser : currentuser
        }
    })
})


exports.updatePassword = catchAsync( async(req,res,next) => {
    const user = await User.findById(req.user.id).select('+password')
   // console.log(user)
    //console.log(user.password)
    if(!await user.correctPassword(req.body.passwordCurrent,user.password)) {
        return next( new AppError('your current password is incorrect',401))
    }
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    await user.save()
    sendToken(user,200,res)
})



exports.updateMe = catchAsync(async(req,res,next)=> {
    const newData  = {
        name : req.body.name,
        email : req.body.email,
    }
    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new : true,
        runValidators : true,
        useFindAndModify : false
    })
    res.status(200).json({
        status:'success',
        data : {
            user : user
        }
    })
})

