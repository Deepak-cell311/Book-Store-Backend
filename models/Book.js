import mongoose from "mongoose";


const bookSchema = new mongoose.Schema({
    title: { type: String, require: true },
    caption: { type: String, require: true },
    image: { type: String, require: true },
    rating: { type: Number, min: 1, max: 5 },
    user: { type: mongoose.Types.ObjectId, ref: "User", require: true },

}, { timestamps: true })

const Book = mongoose.model("Book", bookSchema)
export default Book