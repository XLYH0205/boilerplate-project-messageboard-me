import mongoose from "mongoose";

const replyScheme = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    reported: {
        type: Boolean,
        default: false
    },
    delete_password: {
        type: String,
        required: true
    },
    bumped_on: {
        type: Date,
        default: Date.now
    },
    created_on: {
        type: Date,
        default: Date.now
    },
})

export const Reply = mongoose.model('Reply', replyScheme)