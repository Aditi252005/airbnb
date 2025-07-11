if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}




const express= require("express");
const app= express();
const mongoose = require("mongoose");
//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl= process.env.ATLASDB_URL;

const path = require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const session = require("express-session");
const MongoStore= require("connect-mongo");

const flash= require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User=require("./models/user.js");

const listings= require("./routes/listing.js");
const reviews= require("./routes/review.js");
const user=require("./routes/user.js");
const listingController = require("./controllers/listings.js");


main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
};

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



const store= MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("error in mongo session store",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() +7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly: true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req,res)=>{
//     let fakeUser= new User({
//         email:"student@gmail.com",
//         username:"User1"
//     });
//     let  registeredUser= await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

const Listing = require('./models/listing');

app.get("/", async(req,res)=>{
   const allListings =await Listing.find({});
    res.render("listings/index.ejs",{allListings});  
})


app.use("/listings",listings);
app.use("/listings/:id/reviews" ,reviews);
app.use("/" , user);

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });


app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"} =err;
     res.status(statusCode).render("error",{message});
});

app.listen(8080, ()=>{
    console.log("listening to 8080");
});
