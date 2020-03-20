var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema= new mongoose.Schema({
    name: String,
    email: String,
    batch: String,
    username: String,
    password: String,
    isAdmin: Boolean
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);