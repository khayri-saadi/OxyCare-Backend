const dotenv = require('dotenv')
const User = require('../models/userModel')
const fs = require('fs')
const mongoose  = require('mongoose')
dotenv.config({path : './config.env'})
const DB ='mongodb://localhost:27017/app'
const options = {
  useNewUrlParser : true,
  useUnifiedTopology: true 
}
mongoose.connect(DB,options).then(()=> {
  console.log('DB connected')
})

const doctors = JSON.parse(fs.readFileSync(`${__dirname}/doctors.json`,'utf-8'))
const importdata = async() => {
    try {
        await User.create(doctors,{validateBeforeSave:false})

        console.log('data loaded succesfully')
    } catch(err) {
        console.log(err)
    }
}

const deleteData = async()=> {
    try {
        await User.deleteMany()
    } catch(err) {
        console.log(err)
    }
}
importdata()



