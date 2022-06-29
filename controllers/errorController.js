const AppError = require('../utils/appError')

const handlecastErrorDB = error => {
    const message = `Invalid ${error.path} : ${error.value}`
    return new AppError(message,400)

}
const handleduplicateErrors = err => {
    const message = `Duplicate field value, please enter another name`;
    return new AppError(message,400)
}
const SendValidation = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid Input data . ${errors.join('. ')}`
    return new AppError(message,400)
}
const handleReferenceEroor = err => {
    return new AppError(`undefined variable `,404)
}


const prodError = (err,res)=> {
    if(err.isOperational) {
        // operational trusted error : send message to the client 
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message
        });
// programming or others unknowing errors 
// we don't want leak the errors details to the client 
    } else {
        // 1) log the error 
        console.error('error:',err)

        //2) send generic essage to the client
        res.status(500).json({
            status:'error',
            message : 'something went wrong'
        })
    }
}
const devError = (err,res)=> {
    res.status(err.statusCode).json({
        status : err.status,
        message : err.message,
        stack : err.stack,
        Error : err

    });
}
module.exports = (err,req,res,next)=> {
    //console.log(err.stack)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if(process.env.NODE_ENV ==='development') {
        devError(err,res)
       

    } else if(process.env.NODE_ENVP === 'production') {
        let error = { ...err }
            if(err.name ==='CastError') error =  handlecastErrorDB(error)
            if(err.code === 11000) error = handleduplicateErrors(error)
            if(err.name ==='ValidationError') error = SendValidation(error)
            if(err.name ==='RefernceError') error = handleReferenceEroor(error)
 

        prodError(error,res)
      
    }
    
}