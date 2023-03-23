const express = require("express");
const router = express.Router();

// importing jobs controller method

const {
    getJobs, 
    newJob, 
    getJobsInRadius,
    updateJob,
    deleteJob,
    getJob,
    jobStats
} = require("../controller/jobsController")


router.route("/jobs").get(getJobs);
router.route("/job/new").post(newJob);
router.route("/job/:id").put(updateJob).delete(deleteJob);
router.route("/job/:id/:slug").get(getJob)
router.route("/stats/:topic").get(jobStats)

router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);










module.exports = router;