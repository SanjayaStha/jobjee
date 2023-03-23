

const express = require("express");
const app = express();
const dotenv = require("dotenv")
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
const connectDatabase = require('./config/database')
connectDatabase();

// set up body parser
app.use(express.json())
// "api/v1", 
app.use("/api/v1", jobs)


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
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to handled promise rejection`);
    server.close(()=>{
        process.exit(1);
    })
})
