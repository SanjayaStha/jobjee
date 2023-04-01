const express = require("express");
const router = express.Router();

const { getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs, getUsers, deleteUserByAdmin  } = require("../controller/userController");
const {authorizeRoles, isAuthenticatedUser } = require("../middleware/auth");

router.use(isAuthenticatedUser)
router.route("/me").get(getUserProfile);
router.route("/password/change").post(updatePassword);
router.route("/me/update").put(updateUser);
router.route("/me").delete(deleteUser );
router.route("/jobs/applied").get(authorizeRoles("user"),getAppliedJobs );
router.route("/jobs/published").get(authorizeRoles("admin", "employeer"),getPublishedJobs );


// admin only routes
router.route("/users").get(authorizeRoles("admin"),getUsers );
router.route("/user/:id").delete(authorizeRoles("admin"),deleteUserByAdmin );

module.exports = router;



