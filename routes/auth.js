const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const requireLogin = require('../middleware/requireLogin')


router.post('/signup', (req, res) => {
    const { name, email, password, media } = req.body
    if(!email || !password || !name){
        return res.status(422).json({
            error: "Please add all the fields"
        })
    }
    User.findOne({email: email})
    .then((savedUser) => {
        if(savedUser){
            return res.status(422).json({
                error: "User alrady exists with that email"
            })
        }

        bcrypt.hash(password, 12)
        .then(hashedpassword => {
            const user = new User({
                email,
                password: hashedpassword,
                name,
                media
            })
    
            user.save()
            .then(user => {
                res.json({
                    message: "New user saved successfully"
                })
            })
            .catch(err => {
                console.log(err)
            })
        })
    })
    .catch(err => {
        console.log(err)
    })
})

router.post('/signin', (req, res) => {
    const { email, password } = req.body
    if(!email || !password){
        res.status(422).json({
            error: "Please add all the fields"
        })
    }

    User.findOne({email: email})
    .then(savedUser => {
        if(!savedUser){
            return res.status(422).json({
                error: "Invalid email address or password"
            })
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch){
                const token = jwt.sign({_id: savedUser._id}, process.env.JWT_SECRET)
                const {_id, name, email, followers, following, media} = savedUser
                res.json({
                    message: "Login successful",
                    token,
                    user: {_id, name, email, followers, following, media}
                })
            }else{
                return res.status(422).json({
                    error: "Invalid email address or password"
                })
            }
        })
        .catch(err => {
            console.log(err)
        })
    })
    .catch(err => {
        console.log(err)
    })
})

module.exports = router