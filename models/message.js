const mongoose = require('mongoose')
const User = require('./userModel')

var messageSchema = new  mongoose.Schema({

    message: {
            type: String,
            required :[true,"you can't send an empty message"]
        }
        ,
     sender : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
            required : [true,'a message must related to a sender']
        },
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User', 
    },
    CreatedAt : {
        type:Date,
        Default:Date.now()
    }
  });
messageSchema.pre('save', function(next) {
    this.CreatedAt = Date.now()
    next()
})

  const message = mongoose.model('message',messageSchema)
  module.exports = message