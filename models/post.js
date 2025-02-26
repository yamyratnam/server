const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true,
    },
    media: {
        type: String,
        required: true,
    },
    likes: [{
        type: ObjectId,
        ref: "User"
    }],
    comments: [{
        text: String,
        postedBy: {
            type: ObjectId,
            ref: "User"
        }
    }],
    postedBy: {
        type: ObjectId,
        ref: "User",
    }
})

mongoose.model("Post", postSchema)