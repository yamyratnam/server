const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const User = mongoose.model("User")

router.get('/user/:id', requireLogin, (req, res) => {
    User.findOne({_id: req.params.id})
    .select("-password")
    .then(user => {
        Post.find({postedBy: req.params.id})
        .populate("postedBy", "_id name")
        .then((posts) => {
            if(!posts){
                return res.status(422).json({
                    error: "User doesn't have any posts"
                })
            }
            res.json({user,posts})
        }).catch(err => {
            return res.status(422).json({
                error: err
            })
        })
    }).catch(err => {
        return res.status(404).json({
            error: "User not found"
        })
    })
})

router.put('/follow', requireLogin, async (req, res) => {
    try {
        // Update the user being followed
        const updatedFollowedUser = await User.findByIdAndUpdate(
            req.body.followId,
            { $push: { followers: req.user._id } },
            { new: true }
        ).select('-password'); // Exclude password field

        // Update the current user's following list
        const updatedCurrentUser = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { following: req.body.followId } },
            { new: true }
        ).select('-password'); // Exclude password field

        res.json(updatedCurrentUser);
    } catch (err) {
        res.status(422).json({ error: err.message }); // Return error message
    }
});

router.put('/unfollow', requireLogin, async (req, res) => {
    try {
        // Update the user being followed
        const updatedFollowedUser = await User.findByIdAndUpdate(
            req.body.unfollowId,
            { $pull: { followers: req.user._id } },
            { new: true }
        ).select('-password'); // Exclude password field

        // Update the current user's following list
        const updatedCurrentUser = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: req.body.unfollowId } },
            { new: true }
        ).select('-password'); // Exclude password field

        res.json(updatedCurrentUser);
    } catch (err) {
        res.status(422).json({ error: err.message }); // Return error message
    }
});

module.exports = router