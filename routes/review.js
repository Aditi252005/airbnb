const express= require("express");
const router= express.Router({mergeParams:true});

const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require('../models/listing');
const {validateReview, isLoggedIn, isReviewAuthor}= require("../middleware.js");
const reviewController= require("../controllers/reviews.js");


//reviews
//post review
router.post("/" ,isLoggedIn,validateReview, wrapAsync(reviewController.postReview));
//delete review
router.delete("/:reviewId" ,isLoggedIn,isReviewAuthor,  wrapAsync(reviewController.deleteReview));

module.exports= router;