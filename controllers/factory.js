const mongoose = require('mongoose')
const catchAsync = require('../utils/catchAsync')
exports.CreateOne = Model => catchAsync(async(req,res,next)=> {
    const addDoc = await Model.create(req.body)
    res.status(201).json({
        status : 'success',
        data : {
            addDoc:addDoc
        }
    })
})
exports.updateOne = Model => catchAsync(async(req,res,next)=> {
    const updateDoc = await Model.findByIdAndUpdate(req.params.id,req.body, {
        new:true,
        runValidators:true,
    })
    res.status(201).json({
        status:'success',
        data : {
            updateDoc:updateDoc
        }

    })
})
exports.deleteOne = Model => catchAsync(async(req,res,next)=> {
    const deleteDoc = await Model.findByIdAndDelete(req.params.id)
    res.status(204).json({
        status:'success',
       
    })
})
exports.getall  = Model => catchAsync(async(req,res,next)=> {
    const doc = await Model.find()
    res.status(200).json({
        status:'success',
        results : doc.length,
        data : {
            doc :doc
        }
    })
})
exports.getOne = Model => catchAsync(async(req,res,next)=> {
    const doc = await Model.findById(req.params.id)
    res.status(200).json({
        status:'success',
        data : {
            doc :doc
        }
    })
})


