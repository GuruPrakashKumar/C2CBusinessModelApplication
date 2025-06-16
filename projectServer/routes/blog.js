const express = require("express");
const router = express.Router();
const blogController = require("../controller/blog")
const fileUpload = require('express-fileupload');
router.use(fileUpload({ useTempFiles: true })); // for image file uploading
router.use(express.json());

router.post('/register-for-blogs', blogController.registerForBlogs);
router.post('/login-for-blogs', blogController.loginForBlogs);
router.post('/create-blog', blogController.createBlog);
router.post('/get/:slug', blogController.getBlog);
router.post('/like-blog', blogController.likeBlog);
router.post('/update-blog', blogController.updateBlog);
router.post('/remove-blog', blogController.removeBlog);
router.post('/get-all-blogs', blogController.getAllBlogs);




module.exports = router;