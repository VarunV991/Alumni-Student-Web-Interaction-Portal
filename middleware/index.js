var Questionnaire=require("../models/questionnaire");
var Comment=require("../models/comment");

var middlewareObj={};

middlewareObj.checkQuesPermission=function(req,res,next){
    //is the user logged in
    if(req.isAuthenticated()){
        Questionnaire.findById(req.params.id,function(err,foundQuest){
        if(err){
            req.flash("error","Questionnaire not found");
            res.redirect("/portal"); 
        }
        else{
            //does the user own the question
            console.log(req.user.isAdmin);
            if((foundQuest.author.id.equals(req.user.id)) || (req.user.isAdmin)){
                next();
            }
            else{
                req.flash("error","You don't have permission to do that");
                res.redirect("back");
                } 
            }
        })
    }
    else{
        req.flash("error","You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentPermission=function(req,res,next){
    //is the user logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
        if(err){
            console.log(err);
            res.redirect("/portal"); 
        }
        else{
            //does the user own the comment
            if(foundComment.author.id.equals(req.user.id)){
                next();
            }
            else{
                req.flash("error","You don't have permission to do that");
                res.redirect("back");
                } 
            }
        })
    }
    else{
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that");  //it will not display the message
    res.redirect("/login");
}


module.exports=middlewareObj;