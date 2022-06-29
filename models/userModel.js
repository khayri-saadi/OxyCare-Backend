const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    name : {
        type:String,
        required :[true,'a user must have a name']
    },
    email : {
        type:String,
        required : true,
        unique : true,
        validate :validator.isEmail
    },
    password : {
        type:String,
        required : true,
        minLength : 8,
        select:false
    },
    confirmPassword : {
        type : String,
        validate : {validator : function(el) {
            return el === this.password
        },
        message : 'passwords are not the same'
    } 

    },
    doctor : {
        type:String,
        required : [function() {
            return this.role === 'user'
        }]
    },
    role : {
        type:String,
        enum:['user','admin','doctor'],
        default:'user'
    },
    nom_Capteur : {
        type:String,
        required:[function() {
            return this.role === 'user'
        }]
    },
    matricule :{
        type : String,
        required:[function() {
            return this.role === 'doctor'
        }]
    },
    conversation : {
        type :Array
    },
    passwordChangeAt: {
        type:Date,
        default:Date.now()
    },
    ResetpasswordToken : String,
    passwordResetExpires : Date
  
    },{
        toJSON : {virtuals : true},
        toObject : {virtuals : true}
    }
   
    
    )
userSchema.pre('save', async function(next) {
        if(!this.isModified('password')) return next()
        this.password = await bcrypt.hash(this.password,12) // cryptage de la password au degré 12
        this.confirmPassword = undefined // pour ne pas afficher le confirmPassword dans le database
        if(this.role==='user') this.Lspatients = undefined
        if(this.role==='admin') this.Lspatients = undefined
        next()
    })
userSchema.pre('save', async function(next) {
        if(!this.isModified('password') || this.isNew) return next()
        this.passwordChangeAt = Date.now() -1000
        next()
    
    })
userSchema.methods.correctPassword =  async function(condidatePassword,userpassword) {
        return await  bcrypt.compare(condidatePassword,userpassword)
    }
    userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
        if(this.passwordChangeAt) {
            const changeTimesTamp = parseInt(this.passwordChangeAt.getTime() /1000,10)
            //console.log(changeTimesTamp,JWTTimestamp)
            return JWTTimestamp > changeTimesTamp
        }
        // false mean that the user never changed his password
        return true;
    }
userSchema.virtual('Lspatients', {
        ref : 'User',
        foreignField:'doctor',
        localField :'_id'
    })

userSchema.pre(/^findOne/,function(next) {
    this.populate({
        path:'Lspatients',
        select : ' -__v -passwordChangeAt -conversation -role '
    })
    next()
})
userSchema.methods.sendRandomToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex')
    this.ResetpasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 *1000
    console.log({resetToken}, this.ResetpasswordToken)
    return resetToken ;
}

    
    /*
userSchema.post('save', async function() {
        if(this.role === 'user') {
            const idDoc = this.doctor
            const doc = await User.findById(idDoc)
            //console.log(doc)
            if(doc) {
                doc.Lspatients.push(this)
                doc.save()
            }
            else {
               // console.log('this doctor not found')
            } 
        }

    })

    userSchema.pre('findOneAndDelete', async function(next) {
        this.r = await this.findOne()
        //console.log(this.r+"/n this our document to delete")
        next()
     
    })
    userSchema.post('findOneAndDelete',async function() {
        const user = this.r 
        //console.log(user)
        if(user.role === 'user') {
            const id_docteur = user.doctor
            const doc = await User.findById(id_docteur)
            if(doc) {
                const array = doc.Lspatients
                let pos = array.indexOf(user + "2")
                array.splice(pos,1)
                doc.save()
            }
        }
    })
*/
   
       
const User = mongoose.model('User',userSchema)
module.exports = User