const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const {loginCheck, validateCampground, isAuthor} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(loginCheck, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get("/new", loginCheck, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(loginCheck, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(loginCheck, isAuthor, catchAsync(campgrounds.deleteCampground))
    
router.get('/:id/edit', loginCheck, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;