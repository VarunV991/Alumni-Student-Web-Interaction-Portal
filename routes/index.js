var express=require("express");
var router=express.Router({mergeParams: true});
var User=require("../models/user");
var Questionnaire=require("../models/questionnaire");
var Comment = require("../models/comment");
var passport=require("passport");
var middleware=require("../middleware");

//REGISTER AND LOGIN ROUTES

//starting page
router.get("/",function(req,res){
    res.render("landing");
})

//Display new user register form
router.get("/register",function(req,res){
    res.render("register");
})

//Register new user
router.post("/register",function(req,res){
    var newUser=new User({username: req.body.username,isAdmin: false,name: req.body.name,email: req.body.email,batch: req.body.py});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            res.redirect("register");
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Registered Successfully, "+user.username);
            res.redirect("/portal");
        })
    })
})

//Display login page
router.get("/login",function(req,res){
    res.render("login");
})


router.post("/login",passport.authenticate("local",{
        successRedirect: "/portal",
        failureRedirect: "/login"
        }
    ),function(req,res){
})


//Logout operation
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged Out Successfully!");
    res.redirect("/");
})

router.get("/portal",middleware.isLoggedIn,function(req,res){
    res.render("portal/index");
})

router.get("/portal/verify",middleware.isLoggedIn,function(req,res){
    User.find(function(err,user){
        if(err){
            console.log("Oops");
        }
        else{
            res.render("portal/verify",{user:user , currentUser:req.user});
        }
    })
})

//QUESTIONNAIRE ROUTES

router.get("/portal/questionnaire",middleware.isLoggedIn,function(req,res){
    Questionnaire.find(function(err,question){
        if(err){
            console.log("Oops");
        }
        else{
            res.render("portal/questionnaire/index",{ques:question , currentUser:req.user});
        }
    })
})

router.get("/portal/questionnaire/new",middleware.isLoggedIn,function(req,res){
    res.render("portal/questionnaire/new");
})

//Add a new question
router.post("/portal/questionnaire",middleware.isLoggedIn,function(req,res){
    var name=req.body.name;
    var ques=req.body.question;
    var desc=req.body.description;
    var bool=false;
    var author={
        id: req.user.id,
        username: req.user.username
    }
    Questionnaire.create({
        isVerified:bool,
        name: name,
        question: ques,
        description:desc,
        author:author
    },
    function(err,ques){
        if(err){
            console.log("Oops");
        }
        else{
            req.flash("success","Question will be verified and added soon.");
            res.redirect("/portal/questionnaire");
        }
    });
})

//view a question details
router.get("/portal/questionnaire/:id",function(req,res){
    Questionnaire.findById(req.params.id).populate("replies").exec(function(err,foundQues){
        if(err){
            console.log("Oops")
        }
        else{
            res.render("portal/questionnaire/show",{ques:foundQues});
        }
    })
})

//Edit Route
router.get("/portal/questionnaire/:id/edit",middleware.checkQuesPermission,function(req,res){
    Questionnaire.findById(req.params.id,function(err,foundQues){
        if(err){
            console.log(err);
            res.redirect("/portal/questionnaire"); 
        }
        else{
            res.render("portal/questionnaire/edit",{ques:foundQues});
        }    
    })
})

//Verify Route
router.put("/portal/questionnaire/:id/verify",middleware.checkQuesPermission,function(req,res){
    Questionnaire.findByIdAndUpdate(req.params.id,{isVerified: true},function(err,updatedQues){
        if(err){
            req.flash("error","Something went Wrong");
            res.redirect("/portal/questionnaire");
        }
        else{
            req.flash("success","Question Verified Successfully");
            res.redirect("/portal/questionnaire/"+req.params.id)
        }
    })
})

//Update Route
router.put("/portal/questionnaire/:id",middleware.checkQuesPermission,function(req,res){
    Questionnaire.findByIdAndUpdate(req.params.id,req.body.edit,function(err,updatedQues){
        if(err){
            req.flash("error","Something went Wrong");
            res.redirect("/portal/questionnaire");
        }
        else{
            req.flash("success","Question Updated Successfully");
            res.redirect("/portal/questionnaire/"+req.params.id)
        }
    })
})


//Destroy Route
router.delete("/portal/questionnaire/:id",middleware.checkQuesPermission,function(req,res){
    Questionnaire.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
            res.redirect("/portal/questionnaire");
        }
        else{
            req.flash("success","Question Deleted Successfully");
            res.redirect("/portal/questionnaire")
        }
    })
})

//COMMENT ROUTES

router.get("/portal/questionnaire/:id/replies/new",middleware.isLoggedIn,function(req,res){
    Questionnaire.findById(req.params.id,function(err,foundQues){
        if(err){
            req.flash("error","Something went Wrong");
            console.log(err);
        }
        else{
            res.render("portal/comment/new",{ques:foundQues});
        }
    })
    
})

//Add a new comment
router.post("/portal/questionnaire/:id/replies",middleware.isLoggedIn,function(req,res){
    Questionnaire.findById(req.params.id,function(err,foundQues){
        if(err){
            req.flash("error","Something went Wrong");
            res.redirect("/portal/questionnaire");
        }
        else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    req.flash("error","Something went Wrong");
                }
                else{
                    comment.author.id=req.user.id;
                    comment.author.username=req.user.username;
                    comment.save();
                    foundQues.replies.push(comment);
                    foundQues.save(function(err,data){
                        if(err){
                            req.flash("error","Something went Wrong");
                        }
                        else{
                            req.flash("success","Comment Added Successfully");
                            res.redirect("/portal/questionnaire/"+req.params.id);
                        }
                    })
                }
            })
        }
    })
})

//edit route
router.get("/portal/questionnaire/:id/replies/:comment_id/edit",middleware.checkCommentPermission,function(req,res){
    Comment.findById(req.params.comment_id,function(err,foundComment){
        if(err){
            console.log(err);
        }
        else{
            req.flash("success","Comment Edited Successfully");
            res.render("portal/comment/edit",{ques_id:req.params.id,comment:foundComment});
        }
    })
    
})

//update route
router.put("/portal/questionnaire/:id/replies/:comment_id",middleware.checkCommentPermission,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,newComment){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            req.flash("success","Comment Updated Successfully");
            res.redirect("/portal/questionnaire/"+req.params.id);
        }
    }) 
})

//delete route
router.delete("/portal/questionnaire/:id/replies/:comment_id",middleware.checkCommentPermission,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            req.flash("success","Comment Deleted Successfully");
            res.redirect("/portal/questionnaire/"+req.params.id);
        }
    })
})

//OTHER ROUTES

router.get("/portal/contact_details",middleware.isLoggedIn,function(req,res){
    User.find(function(err,foundUser){
        if(err){
            console.log("Oops");
        }
        else{
            res.render("portal/details",{user:foundUser , currentUser:req.user});
        }
    })
})

router.get("/about",function(req,res){
    res.render("about");
})


module.exports=router;
