const express = require("express");
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");

// importing jobs controller method

console.log("fjdkfjsdkjk")
const {
    getJobs, 
    newJob, 
    getJobsInRadius,
    updateJob,
    deleteJob,
    getJob,
    jobStats,
    applyJob
} = require("../controller/jobsController")


router.route("/jobs").get(getJobs);
router.route("/job/new").post(isAuthenticatedUser, authorizeRoles("employeer", "admin"), newJob);
router.route("/job/:id").put( isAuthenticatedUser, updateJob)
                        .delete( isAuthenticatedUser, deleteJob);
router.route("/job/:id/:slug").get(getJob)
router.route("/stats/:topic").get(jobStats)

router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);

router.route("/job/:id/apply").put(isAuthenticatedUser, authorizeRoles("user"),applyJob)










module.exports = router;