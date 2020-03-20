var mongoose = require("mongoose");

var repliesSchema = new mongoose.Schema({
    text: String,
    date: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Replies", repliesSchema);