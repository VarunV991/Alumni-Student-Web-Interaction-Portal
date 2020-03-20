var mongoose=require("mongoose");

var questionnaireSchema= new mongoose.Schema({
    name: String,
    updated: { type: Date, default: Date.now },
    question: String,
    description: String,
    isVerified: Boolean,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Replies" 
        }
    ]
});

module.exports= mongoose.model("Questionnaire",questionnaireSchema);