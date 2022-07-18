const mongoose = require('mongoose');
const User = mongoose.model('User');
const { jwtkey } = require('../keys');
const jwt = require('jsonwebtoken');

//export middleware for authorization
module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    //Check for authorization header
    if (!authorization) {
        return res.status(401).json({ error: 'You must be logged in' });
    }

    //Token extraction
    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, jwtkey, async(err, payload) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ error: 'You must be logged in 1' });
        }

        const { userId } = payload;

        const user = await User.findById(userId);
        if (user) {
            req.user = user;
            next();
        } else {
            return res.status(401).json({ error: 'You must be logged in' });
        }
    });
}