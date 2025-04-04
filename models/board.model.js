import mongoose from "mongoose";
import { Thread } from "./thread.model.js";

const boardScheme = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    threads: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }],
        default: []
    }
}, { timestamps: true })

export const Board = mongoose.model('Board', boardScheme)