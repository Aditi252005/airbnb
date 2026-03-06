const mongoose= require("mongoose");
const Schema= mongoose.Schema;

const reviewSchema = new Schema({
    comment:String,
    food:{
        type:Number,
        min:1,
        max:5,
    },
    ambience:{
        type:Number,
        min:1,
        max:5,
    },
    price:{
        type:Number,
        min:1,
        max:5,
    },
    staff:{
        type:Number,
        min:1,
        max:5,
    },
    totalRating:Number,
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
});

module.exports= mongoose.model("Review", reviewSchema);