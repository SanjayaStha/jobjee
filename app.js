

const express = require("express");
const app = express();

const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")
const rateLimit = require("express-rate-limit");
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xssClean = require("xss-clean")
const hpp = require("hpp");
const cors = require("cors");

const errorMiddleware = require("./middleware/error")
const ErrorHandler = require("./utils/errorHandler")

// setting up config.env variables
dotenv.config({path: './config/config.env'})

// Handling uncaught exception
process.on("uncaughtException", err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down due to uncaught exception`);
    process.exit(1);
})

// importing all routes
const jobs = require("./routes/jobs")
const auth = require("./routes/auth")
const users = require("./routes/users")
const connectDatabase = require('./config/database')
connectDatabase();

// set up body parser
app.use(express.json());
// set cookie parser
app.use(cookieParser())

// handle file uploads
app.use(fileUpload())

// sanitize data
app.use(mongoSanitize()) 

//  prevent xss attacks
app.use(xssClean())

// prevent parameter pollution
app.use(hpp({
    whitelist: ['postitions']
}))

// setup security headers
app.use(helmet())

// rate limiting
const limiter = rateLimit({
    windowMs: 10*60*1000,
    max: 100
})
app.use(limiter);

// setup cors accessible by other domains
app.use(cors());

// "api/v1", 
app.use("/api/v1", jobs)
app.use("/api/v1", auth)
app.use("/api/v1", users)


// after all routes
// handle unhandled routes
app.all("*", (req, res, next)=>{
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404))
})

// middleware to handle error
app.use(errorMiddleware)


// connecting to database


const PORT = process.env.PORT;
const server = app.listen(PORT, ()=>{
    console.log(`Server started in port ${PORT} in ${process.env.NODE_ENV}`);
})

// handiling unhandled promise rejection
process.on("unhandledRejection", err => {
    console.log(`Error: ${err}`);
    console.log(`Shutting down the server due to handled promise rejection`);
    server.close(()=>{
        process.exit(1);
    })
})
