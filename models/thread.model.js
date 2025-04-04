import mongoose from "mongoose";

const threadScheme = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    bumped_on: {
        type: Date,
        default: Date.now
    },
    reported: {
        type: Boolean,
        default: false
    },
    delete_password: {
        type: String,
        required: true
    },
    replies: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reply'
        }],
        default: []
    }

})
export const Thread = mongoose.model('Thread', threadScheme)