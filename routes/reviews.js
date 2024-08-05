const express = require('express')
const router = express.Router({mergeParams: true}) // get access to the id param in the app.js
const Review = require('../models/review')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const {validateReview, loginCheck, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews')

router.post('/', loginCheck, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', loginCheck, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;