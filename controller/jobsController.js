const Job = require("../models/jobs")
const getLongitudeLatitudeFromFakeZipCode = require("../utils/geocoder")

//  get all jobs => /api/v1/jobs
exports.getJobs = async (req, res, next) => {
    const jobs = await Job.find();

    res.status(200).json({
        success: 200,
        result: jobs.length,
        data: jobs
    })
}
// create a new job => /api/v1/job/new

exports.newJob = async (req, res, next)=>{
    console.log("New job trigger"+ req.body);
    const job = await Job.create(req.body);

    res.status(200).json({
        success: true,
        message: "Job Created",
        data: job
    })
}


// search jobs with radius => /api/v1/jobs/:zipcode/:distance

exports.getJobsInRadius = async (req, res, next) => {
    const {zipcode, distance} = req.params;

    // getting latitude and longitude from zipcode
    const loc = getLongitudeLatitudeFromFakeZipCode(zipcode);
    const latitude = loc.latitude;
    const longitude = loc.longitude;

    const radius = distance / 3963;


    const jobs = await Job.find({
        location: {$geoWithin: {$centerSphere: [[longitude, latitude], radius ]}}
    })

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    })
}


