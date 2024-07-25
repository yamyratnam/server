const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")

router.post('/create-post', requireLogin, (req, res) => {
    const { caption, media } = req.body
    console.log(caption,media)
    if(!caption){
        return res.status(422).json({
            error: "Caption is required"
        })
    }

    if(!media){
        return res.status(422).json({
            error: "Media is required"
        })
    }

    req.user.password = undefined
    const post = new Post({
        caption,
        postedBy: req.user,
        media
    })

    post.save()
    .then(result => {
        res.json({
            message: "New post created Successfully",
            post: result
        })
    })
    .catch(err => {
        console.log(err)
    })
})

router.get('/view-all-posts', requireLogin, (req, res) => {
    Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then(posts => {
        res.json({posts})
    })
    .catch(err => {
        console.log(err) 
    })
})

router.get('/view-following-posts', requireLogin, (req, res) => {
    Post.find({postedBy: {$in: req.user.following}})
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then(posts => {
        res.json({posts})
    })
    .catch(err => {
        console.log(err) 
    })
})

router.get('/view-user-posts', requireLogin, (req, res) => {
    Post.find({postedBy: req.user._id})
    .populate("postedBy", "_id name")
    .then(userpost => {
        res.json({userpost})
    })
    .catch(err => {
        console.log(err)
    })
})

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {likes: req.user._id}
    }, {
        new: true
    })
    .then((result) => {
        if(result){
            res.json({
                message: "Liked post Successfully",
                result
            })
        }else{
            return res.status(422).json({
                error: "Cannot like post"
            })
        }
    }).catch(err => {
        console.log(err)
    })
})

router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {likes: req.user._id}
    }, {
        new: true
    })
    .then((result) => {
        if(result){
            res.json({
                message: "Unliked post Successfully",
                result
            })
        }else{
            return res.status(422).json({
                error: "Cannot unlike post"
            })
        }
    }).catch(err => {
        console.log(err)
    })
})

router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {comments: comment}
    }, {
        new: true
    })
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .then((result) => {
        if(result){
            res.json({
                message: "Commented Successfully",
                result
            })
        }else{
            return res.status(422).json({
                error: "Cannot comment"
            })
        }
    }).catch(err => {
        console.log(err)
    })
})

router.delete('/delete-post/:postId', requireLogin, (req, res) => {
    Post.findOne({_id: req.params.postId})
    .populate("postedBy", "_id")
    .then((post) => {
        if(!post){
            return res.status(422).json({
                error: "err"
            })
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.deleteOne()
            .then(result => {
                res.json({
                    message: "Post deleted successfully",
                    result
                })
            }).catch(err => {
                console.log(err)
            })
        }
    }).catch(err => {
        console.log(err)
    })
})

router.delete('/delete-comment/:postId/:commentId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
        .populate('comments.postedBy', '_id') 
        .then((post) => {
            if (!post) {
                return res.status(422).json({
                    error: 'Post not found',
                });
            }

            const comment = post.comments.find((comment) => comment._id.toString() === req.params.commentId);

            if (!comment || comment.postedBy._id.toString() !== req.user._id.toString()) {
                return res.status(422).json({
                    error: 'Comment not found or unauthorized',
                });
            }
            
            post.comments.pull({ _id: req.params.commentId });

            post.save()
                .then((result) => {
                    res.json({
                        message: 'Comment deleted successfully',
                        result,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        error: 'Internal server error',
                    });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: 'Internal server error',
            });
        });
});

module.exports = router