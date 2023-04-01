const express = require("express");
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");

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
router.route("/job/new").post(isAuthenticatedUser, authorizeRoles("employer", "admin"), newJob);
router.route("/job/:id").put( isAuthenticatedUser, updateJob)
                        .delete( isAuthenticatedUser, deleteJob);
router.route("/job/:id/:slug").get(getJob)
router.route("/stats/:topic").get(jobStats)

router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);










module.exports = router;