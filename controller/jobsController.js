const Job = require("../models/jobs")
const getLongitudeLatitudeFromFakeZipCode = require("../utils/geocoder")
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncError")
const APIFilters = require("../utils/apiFilters")
const path = require("path")
const fs = require("fs");



//  get single job => /api/v1/job/:id/:slug
exports.getJob = catchAsyncErrors(async (req, res, next) => {

    const job = await Job.find({ $and: [{ _id: req.params.id }, { slug: req.params.slug }] }).populate({
        path: 'user',
        select: 'name'
    });

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

    // console.log("khjhjhjh")
    const apiFilters = new APIFilters(Job.find(), req.query).filter().sort().limitFields().searchByQuery().pagination();
    const jobs = await apiFilters.query;

    res.status(200).json({
        success: 200,
        result: jobs.length,
        data: jobs
    })
});
// create a new job => /api/v1/job/new

exports.newJob = catchAsyncErrors(async (req, res, next) => {

    // adding user to body,
    req.body.user = req.user.id;

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

    let job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorHandler("Job not found", 404))
    }

    // check if user is owner
    if (job.user.toString() !== req.user.id && req.user.role !== admin) {
        return next(new ErrorHandler(`User(${req.user.id}) is not allowed to update this job`))
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
    // check if user is owner
    if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(new ErrorHandler(`User(${req.user.id}) is not allowed to delete this job`))
    }

    // deleting files associated with jobs
    const delJob = await Job.findOne({ _id: req.params.id }).select("+applicantsApplied");
    console.log({delJob});
    for (let i = 0; i < delJob.applicantsApplied.length; i++) {
        let filepath = `${__dirname}/resumes/${delJob.applicantsApplied[i].resume}`.replace("\\controller", "");
        fs.unlink(filepath, err => {
            if (err) return console.log(err);
        });
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

// apply to jobb using Resume => /api/v1/job/:id/apply

exports.applyJob = catchAsyncErrors(async (req, res, next) => {
    let job = await Job.findById(req.params.id).select('+applicantsApplied');
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // check that if job has not expired
    if (job.lastDate < new Date(Date.now())) {
        return next(new ErrorHandler("You can not apply to this job. Date is over", 400))
    }

    // console.log({job});
    // check if user has applied before
    for (let i = 0; i < job.applicantsApplied.length; i++) {
        if (job.applicantsApplied[i].id == req.user.id) {
            return next(new ErrorHandler("Your have already applied to this job", 400))
        }
    }

    // check the files
    if (!req.files) {
        return next(new ErrorHandler("Please upload file.", 400))
    }
    const file = req.files.file;

    // check file type
    const supportedFiles = /.docs|.pdf/;
    if (!supportedFiles.test(path.extname(file.name))) {
        return next(new ErrorHandler("Please upload document file .pdf or .docs", 400))
    }

    // check file size
    if (file.size < process.env.MAX_FILE_SIZE) {
        return next(new ErrorHandler(`Please upload file less than ${process.env.MAX_FILE_SIZE}MB`), 400);
    }

    // Renaming resume
    file.name = `${req.user.name.replace(' ', '_')}_${req.params.id}${path.parse(file.name).ext}`;
    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err)
            return next(new ErrorHandler("Resume upload failed", 500));
        }

        await Job.findByIdAndUpdate(req.params.id, {
            $push: {
                applicantsApplied: {
                    id: req.user.id,
                    resume: file.name
                }
            }
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            message: "Applied to Job successfully",
            data: file.name
        })
    })

})




