const Msg= require('../models/message')
const mongoose = require('mongoose')
const factory = require('./factory')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')

exports.createMsg = catchAsync(async(req,res,next)=> {
    if(req.user.role === 'user') {
      if(!req.body.sender) req.body.sender = req.user.id
      if(!req.body.receiver) req.body.receiver = req.user.doctor
        const addDoc = await Msg.create(req.body)
        res.status(201).json({
            status : 'success',
            data : {
                addDoc:addDoc
            }
        })
    } else if( req.user.role === 'doctor') {
        const iduser = req.params.id
        const tabid = req.user.Lspatients.map( el=>  {
          return el.id === iduser
        })
        if(tabid.includes(true)) {
            if(!req.body.sender) req.body.sender = req.user.id
            if(!req.body.receiver) req.body.receiver = req.params.id
            const addDoc = await Msg.create(req.body)
        res.status(201).json({
            status : 'success',
            data : {
                addDoc:addDoc
            }
        })
        }
    }
   
})
exports.getdiscussion = catchAsync(async(req,res,next)=> {
    if(req.user.role === 'user') {
        const query = {
            $or: [ {sender : req.user.id } ,{ receiver: req.user.id}]
        }
            const discussion = await Msg.find(query)
            res.status(200).json({
                status:'success',
                data : {
                    discussion : discussion
                }
            })      
         }
         //$and: [
          //  { $or: [{a: 1}, {b: 1}] },
          //  { $or: [{c: 1}, {d: 1}] }
else if(req.user.role === 'doctor') {
    const query = ({
        $or : [
            { $and : [{sender : req.user._id},{receiver : req.params.id}]},
            { $and : [{sender : req.params.id},{receiver : req.user._id}]},
        ]
    })
    const discussion = await Msg.find(query)
    res.status(200).json({
        status:'success',
        data : {
            discussion : discussion
        }
    })
}})
exports.getAllMsg = factory.getall(Msg)
exports.getOneMessage = factory.getOne(Msg)
exports.deleteMessage = factory.deleteOne(Msg)
exports.updateMessage = factory.updateOne(Msg)