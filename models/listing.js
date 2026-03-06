const mongoose=require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { ref } = require("joi");

const listingSchema= new Schema({
    title: {
        type:String,
        required: true,
    },
    description:String,
    image:{
       url: String,
       filename: String,
    },
    price:{
        type: Number,
        required: true,
        default:0,
    },
    location:String,
    country:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    avgRating: {
        type: Number,
        default: 0
    },

    reviewCount: {
        type: Number,
        default: 0
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
    },
});


listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});


const Listing= mongoose.model("Listing", listingSchema);
module.exports= Listing;