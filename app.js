

const express = require("express");
const app = express();
const dotenv = require("dotenv")


// setting up config.env variables
dotenv.config({path: './config/config.env'})

// importing all routes
const jobs = require("./routes/jobs")
const connectDatabase = require('./config/database')
connectDatabase();

// set up body parser
app.use(express.json())

// "api/v1", 
app.use("/api/v1", jobs)


// connecting to database


const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server started in port ${PORT} in ${process.env.NODE_ENV}`);
})



