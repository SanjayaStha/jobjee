const ErrorHandler = require("../utils/errorHandler")

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;


    if(process.env.NODE_ENV === 'development'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV.trim() === 'production'){
        let error = {...err};
        error.message = err.message
        console.log(error.message)

        // wrong mogoose object id
        if(err.name === "CastError"){
            const message = `Resource not found and invalid ${err.path}`
            error = new ErrorHandler(message, 404)
        }

        // handling mongoose validation error
        if(error.name === "ValidationError"){
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400)
        }


        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
            error = new ErrorHandler(message, 400);
        }

        if(err.name == "JsonWebTokenError") {
            const message = 'JSON Web Token is invalid Try again';
            error = new ErrorHandler(message, 500)
        }

        // handling expired jwt token error
        if(err.name == "TokenExpiredError") {
            const message = 'JSON Web Token is expired, Try again';
            error = new ErrorHandler(message, 500)
        }
        

        res.status(error.statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }

}


