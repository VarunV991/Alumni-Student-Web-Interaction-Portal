var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash=require("connect-flash");
var methodOverride =require("method-override")
var app = express();
var passport=require("passport");
var LocalStrategy=require("passport-local");
var User = require("./models/user");

// mongoose.connect("mongodb://localhost/alumniport",{useNewUrlParser: true});
mongoose.connect("mongodb+srv://varunv:A3zTC4kuG8f2hE3G@cluster0-sbojk.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true});


app.set("view engine","ejs");
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

var authRoutes=require("./routes/index");
app.use(authRoutes);
//PASSPORT 

app.use(require("express-session")({
    secret: "This ProJect Is awesome",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){                 //adding our own middleware so that currentUser is
    res.locals.currentUser=req.user;            //passed to every route
    res.locals.error=req.flash("error")
    res.locals.success=req.flash("success");
    next();
})

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("AlumniPortal has started");
})