import express from 'express'
const router = express.Router()
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "10d" })
}

router.post("/register", async (req, res) => {
    // res.status(200).send("Regsitser route")
    try {
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" })
        }

        if (password.length < 6) return res.status(400).json({ message: "Password should be at least 6 characters" })
        if (username.length < 3) return res.status(400).json({ message: "Username should be at least 3 characters" })

        const userExist = await User.findOne({ email })
        if (userExist) return res.status(400).json({ message: "Email already exist" })

        // Get random avatar
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        const newUser = new User({ username, password, email, profileImage })
        await newUser.save()

        // Json Token
        const token = generateToken(newUser._id)
        return res.status(201).json({ message: "User Registered successfully", token, user: { _id: newUser._id, username: newUser.username, email: newUser.email, profileImage: newUser.profileImage } })

    } catch (error) {
        console.log("Error: ", error)
        return res.status(500).json({ message: "User Registration failed", error: error.message })
    }
})

router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all fields" })
        }
        const userExist = await User.findOne({ email })
        if (!userExist) res.status(400).json({ message: "Invalid credentials" })
        // const matchPassword = await bcrypt.compare(password, userExist.password)
        const matchPassword = await userExist.comparePassword(password)
        if (!matchPassword) return res.status(400).json({ message: "Invalid credentials" })

        const token = generateToken(userExist._id)

        return res.status(200).json({
            message: "User Login successfully", 
            token, 
            user: {
                id: userExist._id, 
                email: userExist.email, 
                profileImage: userExist.profileImage
            }})
    } catch (error) {
        console.log("Error: ", error)
        return res.status(500).json({ message: "User login failed", error: error.message })
    }
})

export default router