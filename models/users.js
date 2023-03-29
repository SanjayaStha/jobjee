const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter valid email address"]
    },
    role: {
        type:String,
        enum:{
            values: ["user", "employeer", "admin"],
            message: "Please select correct role"
        },
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "Please enter password for  your account"],
        minlength: [8, "Your password must be at least 8 character long"],
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken : String,
    resetPasswordExpire : Date

});

// encrypting password before saving
userSchema.pre("save", async function(next){
    this.password = await bcrypt.hash(this.password, 10)
});

// return json web token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({id: this._id, }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// compare user password with db password
userSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword, this.password)
}

module.exports = mongoose.model('User', userSchema);




