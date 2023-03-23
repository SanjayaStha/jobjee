const Job = require("../models/jobs")
const getLongitudeLatitudeFromFakeZipCode = require("../utils/geocoder")
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncError")





//  get single job => /api/v1/job/:id/:slug
exports.getJob = catchAsyncErrors(async (req, res, next) => {
    const job = await Job.find({ $and: [{ _id: req.params.id }, { slug: req.params.slug }] });

    if (!job || job.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Job not found"
        })
    }

    res.status(200).json({
        success: 200,
        message: "Job found",
        data: job
    })
});



//  get all jobs => /api/v1/jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
    const jobs = await Job.find();

    res.status(200).json({
        success: 200,
        result: jobs.length,
        data: jobs
    })
});
// create a new job => /api/v1/job/new

exports.newJob = catchAsyncErrors(async (req, res, next) => {
    console.log("New job trigger" + req.body);
    const job = await Job.create(req.body);

    res.status(200).json({
        success: true,
        message: "Job Created",
        data: job
    })
})


// search jobs with radius => /api/v1/jobs/:zipcode/:distance

exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // getting latitude and longitude from zipcode
    const loc = getLongitudeLatitudeFromFakeZipCode(zipcode);
    const latitude = loc.latitude;
    const longitude = loc.longitude;

    const radius = distance / 3963;


    const jobs = await Job.find({
        location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
    })

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    })
})

// update job => /api/v1/job/:id

exports.updateJob = catchAsyncErrors(async (req, res, next) => {

    console.log(req)
    let job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorHandler("Job not found", 404))
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: "Job is updated",
        data: job
    })
})

// delete the job => /api/v1/jobs/:id

exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
    let job = await Job.findById(req.params.id)

    if (!job) {
        return next(new ErrorHandler("Job not found", 404))
    }

    job = await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Job deleted successfully",
        data: job


    })

})

// get stats about the job with a topic => /api/v1/stats/:topic
exports.jobStats = catchAsyncErrors(async (req, res, next) => {
    const stats = await Job.aggregate([
        {
            $match: { $text: { $search: "\"" + req.params.topic + "\"" } }
        },
        {
            $group: {
                _id: { $toUpper: "$experience" },
                totalJobs: { $sum: 1 },
                avgPosition: { $avg: "$positions" },
                avgSalary: { $avg: "$salary" },
                minSalary: { $min: "$salary" },
                maxSalary: { $max: "$salary" },
            }
        }
    ]);

    if (stats.length === 0) {
        return next(new ErrorHandler(`No stats found for - ${req.params.topic}`, 200))
    }

    res.status(200).json({
        success: true,
        data: stats
    })
})






