
const User = require("../models/users")
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

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

});


// forgot password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    // check if user email is in database
    if(!user){
        return next(new ErrorHandler("No User found with this Email", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false});

    // create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset link is as follow: \n\n ${resetUrl} \n\n if you have not request this please ignore that.`

    try {
        await sendEmail({
            email: user.email,
            subject: "Jobjee Api password recovery",
            message
        })
    
        res.status(200).json({
            success: true,
            message: `Email sent successfully to: ${user.email}`
        });  
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error, 500));
    }


})
