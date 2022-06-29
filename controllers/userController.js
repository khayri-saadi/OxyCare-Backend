const User = require('../models/userModel')
const factory = require('./factory')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')


const getusers = catchAsync(async(req,res,next)=> {
    if(req.user.role === 'user') {
        const medcins = await User.find({
            role :'doctor'
        }
            )
        res.status(200).json({
            status:'success',
            data : {
                medcins:medcins
            }
        })
    }
    else if(req.user.role ==='doctor') {
       const getdoctor = await User.findById(req.user._id)
       res.status(200).json({
           status : 'success',
           data : {
               getdoctor:getdoctor
           }
       })
    }
})
const getOneuser = catchAsync(async(req,res,next)=> {
    if(req.user.role ==='doctor'){
        const iduser = req.params.id
        const tabid = req.user.Lspatients.map( el=>  {
          return el.id === req.params.id
        })
        if(tabid.includes(true)) {
            const monC = await User.findById(iduser)
            res.status(200).json({
                status:'success',
                data : {
                    monC:monC
                }
            })
        } 
        else {
            return next(new AppError("You don't have the permission to perform this action"))
        }
       } 
    else if( req.user.role ==='user') {
           const mondoc = await User.findById(req.user.doctor)
           res.status(200).json({
               status:'success',
               data : {
                   mondoc : mondoc
               }
           })
       } 
 
})

const getALL = factory.getall(User)
const addUser =  factory.CreateOne(User)
const updateUser = factory.updateOne(User)
const deleteUser = factory.deleteOne(User)


module.exports = {
    addUser:addUser,
    updateUser : updateUser,
    deleteUser,deleteUser,
    getusers:getusers,
    getOneuser:getOneuser,
    getALL:getALL
   
}