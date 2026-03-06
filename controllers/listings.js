const Listing = require('../models/listing');
const Review =require("../models/review.js");


module.exports.index=async (req,res)=>{
    //const allListings =await Listing.find({});
    const allListings = await Listing.find({}).populate("reviews");

    res.render("listings/index.ejs",{allListings});  
}

module.exports.newListing=(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author"
        },
    }).populate("owner");
    if(!listing){
        req.flash("error","Requested Listing does not exist");
        return res.redirect("/listings");
    }
    
   // res.render("listings/show.ejs" , {listing});
    let foodAvg = 0;
    let ambienceAvg = 0;
    let priceAvg = 0;
    let staffAvg = 0;

    if (listing.reviews.length > 0) {

        listing.reviews.forEach(r => {
            foodAvg += r.food;
            ambienceAvg += r.ambience;
            priceAvg += r.price;
            staffAvg += r.staff;
        });

        foodAvg = (foodAvg / listing.reviews.length).toFixed(1);
        ambienceAvg = (ambienceAvg / listing.reviews.length).toFixed(1);
        priceAvg = (priceAvg / listing.reviews.length).toFixed(1);
        staffAvg = (staffAvg / listing.reviews.length).toFixed(1);

    }

    res.render("listings/show.ejs", {
        listing,
        foodAvg,
        ambienceAvg,
        priceAvg,
        staffAvg
    });
}

module.exports.createListing=async (req,res,next)=>{
   let url=req.file.path;
   let filename= req.file.filename;
    const newListing= new Listing(req.body.listing);
    newListing.owner= req.user._id;
    newListing.image= {url,filename};
    await newListing.save();
    req.flash("success","new listing created!");
    res.redirect("/listings");
}

module.exports.editListing=async (req,res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
      if(!listing){
        req.flash("error","Requested Listing does not exist");
        return res.redirect("/listings");
    }
    let origImageUrl=listing.image.url;
    origImageUrl=origImageUrl.replace("/upload","/upload/w_25");
    res.render("listings/edit.ejs", {listing, origImageUrl});
}

module.exports.updateListing=async (req,res)=>{
    let {id}= req.params;

    let listing= await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url= req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success" , "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing=async (req,res)=>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
}


module.exports.searchListings = async (req, res) => {

    const query = req.query.q;

    const listings = await Listing.find({
        title: { $regex: query, $options: "i" }
    });

    res.render("listings/index", { allListings: listings });
};