const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    media: {
        type: String,
        default: 'https://res.cloudinary.com/dwfqxhw42/image/upload/v1707224842/download_jmtnld.jpg'
    },
    followers: [{
        type: ObjectId,
        ref: "User",
    }],
    following: [{
        type: ObjectId,
        ref: "User",
    }]
})

mongoose.model("User", userSchema)