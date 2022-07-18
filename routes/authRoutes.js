const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { jwtkey } = require('../keys')
const router = express.Router();
const User = mongoose.model('User');


router.post('/signup', async(req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(402).json({ error: 'Fill all the required fields' });
    } else {
        await User.find({ email }, (err, user) => {
            if (err) {
                return res.status(402).json({ error: 'Invalid username or password' });
            } else if (user.length > 0) {
                return res.status(402).json({ error: 'User already exists' });
            } else {
                ValidateEmail(email, password, res);
            }
        }).clone()
    }

})

router.post('/signin', async(req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(422).send({ error: "must provide email or password" })
    }
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(422).send({ error: "must provide email or password" })
    }
    try {
        await user.comparePassword(password);
        const token = jwt.sign({ userId: user._id }, jwtkey)
        res.send({ token })
    } catch (err) {
        return res.status(422).send({ error: "must provide email or password" })
    }

})


const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

const validateEmailString = (email) => {

    return regex.test(email);

}

const ValidateEmail = async(email, password, res) => {

    if (validateEmailString(email)) {
        try {
            const user = new User({ email, password });
            await user.save();
            const token = jwt.sign({ userId: user._id }, jwtkey)
            res.status(200).json({ success: "Successful registration", token: token })

        } catch (err) {
            console.log(err);
            return res.status(422).send(err.message)
        }
    } else {
        return res.status(402).json({ error: 'Invalid email' });
    }
}


module.exports = router