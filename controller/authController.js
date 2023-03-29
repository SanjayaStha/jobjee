
const User = require("../models/users")
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken")


// register new user => /api/v1/register

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const {name, email, password, role} = req.body;

    const user = await User.create({
        name, 
        email, 
        password,
        role
    })

    sendToken(user, 200, res);
})


exports.loginUser = catchAsyncErrors(async (req, res, next)=>{
    const {email, password} = req.body;

    // checks if email or password is entered by user
    if(!email || !password){
        return next(new ErrorHandler("Please enter email & password"), 400)
    }

    // Finding user in database
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        return next(new ErrorHandler("Invalid Email or Password."), 401)
    }

    // check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password"), 401);
    }

    sendToken(user, 200, res);

})
