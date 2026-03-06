
const Listing = require('../models/listing');
const Review= require("../models/review.js");


module.exports.postReview = async (req, res) => {
   let listing = await Listing.findById(req.params.id);

   const food = Number(req.body.review.food);
   const ambience = Number(req.body.review.ambience);
   const price = Number(req.body.review.price);
   const staff = Number(req.body.review.staff);

    const totalRating = (food + ambience + price + staff) / 4;

   let newReview = new Review({
      food,
      ambience,
      price,
      staff,
      comment: req.body.review.comment,
      totalRating
   });

   newReview.author = req.user._id;

   listing.reviews.push(newReview);


    listing.avgRating =
    ((listing.avgRating * listing.reviewCount) + totalRating) /
    (listing.reviewCount + 1);

    listing.reviewCount += 1;

   await newReview.save();
   await listing.save();

   req.flash("success", "New review Created");
   res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;

    const listing = await Listing.findById(id);
    const review = await Review.findById(reviewId);

    if (!listing || !review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    if (listing.reviewCount > 1) {

        listing.avgRating =
            ((listing.avgRating * listing.reviewCount) - review.totalRating) /
            (listing.reviewCount - 1);

        listing.reviewCount -= 1;

    } else {

        listing.avgRating = 0;
        listing.reviewCount = 0;

    }

    await listing.save();

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};