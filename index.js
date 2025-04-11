// const dotenv = require('dotenv');
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from "cors"
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import authRoutes from './routers/authRoutes.js'
import bookRoutes from "./routers/bookRoutes.js"
import job from './lib/cron.js'


const app = express();
const port = process.env.PORT || 5000;

job.start()

app.use(express.json());
app.use(cors())
app.use(bodyParser.json())

// Database connection 
const MongoDB_URI = process.env.MONGODB_URI;
mongoose.connect(MongoDB_URI).then(() => {
    console.log(`Database Connected Successfully`);
}).catch((error) => {
    console.error('MongoDB connection error:', error.message);
});

app.get('/', (req, res) => {
    res.send('Server is running successfully')
})

app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
