import jwt from 'jsonwebtoken'
import 'dotenv/config'
import User from '../models/User.js'


const protectRoute = async (req, res, next) => {
    try {
        //get token
        const token = req.header("Authorization").replace("Bearer", "")
        if (!token) return res.status(401).json({ message: "No authorized token , access denied", error: error.message })

        // verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET)

        // find user
        const user = await User.findById(decode.userId).select('-password')
        if (!user) return res.status(401).json({ message: "Token is not valid", error: error.message })

        req.user = user
        next()

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export default protectRoute