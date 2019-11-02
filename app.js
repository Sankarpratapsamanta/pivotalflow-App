require('dotenv').config();
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const methodOverride=require("method-override");
const passport=require("passport");
const session = require("express-session");
const passportLocalMongoose=require("passport-local-mongoose");
const LocalStrategy=require("passport-local");
const User=require("./models/user");
const flash=require("connect-flash");
const product=require("./models/product");
const blog=require("./models/blog");
const stripe=require("stripe");
const multer=require("multer");
const indexRoutes=require("./routes/index");
const userRoutes=require("./routes/user");
const adminRoutes=require("./routes/admin");
const productRoutes=require("./routes/product");
const blogRoutes=require("./routes/blog");
const bookingRoutes=require("./routes/booking");




 mongoose.connect(process.env.DATABASEURL.toString());


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(flash());
app.use(session({
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  }));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.use(new LocalStrategy(User.authenticate()));
passport.deserializeUser(User.deserializeUser());
app.use(methodOverride("_method"));
app.use(function(req,res,next){
    res.locals.currentuser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
});

app.use(indexRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use(productRoutes);
app.use(blogRoutes);
app.use(bookingRoutes);




const PORT = process.env.PORT || 3000;

// app.listen(process.env.PORT,function(){
//     console.log("server started");
// });

app.listen(PORT,function(){
    console.log("server started")
})
