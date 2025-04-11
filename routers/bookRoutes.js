import express from 'express'
import Book from '../models/Book.js'
import cloudinary from "../lib/cloudinary.js"
import protectRoute from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', protectRoute, async (req, res) => {
    try {
        
        const { title, caption, image, rating } = req.body
        if(!title || !caption || !image || !rating ){
            return res.status(400).json({ message: "Please fill all fields" })
        }

        // Upload image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image)
        const imageUrl = uploadResponse.secure_url

        // Save to the database
        const newBook = new Book({
            title, caption, rating, image: imageUrl, 
            user: req.user._id
        })

        await newBook.save()
        res.status(200).json({message: "New Book created", newBook})

    } catch (error) {
        return res.status(500).json({ message: "Book Creation failed", error: error.message })
    }
})

// pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
    
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 5
        const skip = (page - 1) * limit

        const books = await Book.find()
        .sort({createdAt: -1})      // sort by createdAt in descending order
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage")    // populate user field with username and profileImage
        
        const totalBooks = await Book.countDocuments()

        res.status(200).json({ 
            message: "All Books", 
            books, 
            currentPage: page, 
            totalBooks: books.length,
            totalPages: Math.ceil(totalBooks / limit)
        })
    } catch (error) {
        return res.status(500).json({ message: "Book fetch failed", error: error.message })
    }
})

router.get('/user', protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1})
        if (!books) return res.status(404).json({ message: "Book not found" })
        res.json({ books})
    } catch (error) {
        return res.status(500).json({ message: "Book fetch failed", error: error.message })
    }
})

router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const bookId = req.params.id
        const book = await Book.findById(bookId)

        if (!book) return res.status(404).json({ message: "Book not found" })
        if (book.user.toString() !== req.user._id.toString()) 
            return res.status(401).json({ message: "Not authorized to delete this book" })

        
        // Delete image from cloudinary
        
        if(book.image && book.image.includes("cloudinary")){
            try {
                const publicId = book.image.split('/').pop().split('.')[0]
                await cloudinary.uploader.destroy(publicId)
                return res.status(200).json({ message: "Book deleted successfully" })
            } catch (error) {
                return res.status(500).json({ message: "Book deletion failed", error: error.message })
            }
        }
        // Remove book from database
        // await book.remove()
        await book.deleteOne()
        res.status(200).json({ message: "Book deleted successfully" })

    } catch (error) {
        return res.status(500).json({ message: "Book deletion failed", error: error.message })
    }
})

export default router