import { Thread } from "../models/thread.model.js";
import { Reply } from "../models/reply.model.js";

export const getReply = async (req, res) => {
    const { thread_id } = req.query;
    try {
        const thread = await Thread.findById(thread_id).select('-delete_password -reported')
            .populate({
                path: 'replies',
                options: {
                    sort: { bumped_on: -1 },
                    select: '-delete_password -reported'
                }
            });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json(thread);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export const addReply = async (req, res) => {

    const { thread_id, text, delete_password } = req.body;

    try {
        const thread = await Thread.findById(thread_id);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const newDate = new Date();

        const newReply = new Reply({
            text,
            delete_password,
            bumped_on: newDate,
            created_on: newDate
        });
        await newReply.save();

        thread.replies.push(newReply._id);
        thread.bumped_on = newDate;
        await thread.save();

        res.status(200).json(newReply);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export const reportReply = async (req, res) => {

    const { thread_id, reply_id } = req.body;

    try {
        const reply = await Reply.findById(reply_id);
        if (!reply) {
            return res.status(404).json("not found");
        }

        reply.reported = true;
        await reply.save();

        res.status(200).send("reported");
    } catch (error) {
        res.status(500).json("server error");
    }
}

export const deleteReply = async (req, res) => {
    const { thread_id, reply_id, delete_password } = req.body;

    try {
        const reply = await Reply.findById(reply_id);
        if (!reply) {
            console.log("not found");
            return res.status(404).json("not found");
        }

        if (reply.delete_password !== delete_password) {
            console.log("incorrect password");
            return res.status(403).send("incorrect password");
        }

        reply.text = "[deleted]";

        await reply.save();
        console.log("success");
        res.status(200).send("success");
    } catch (error) {
        res.status(500).json("server error");
    }
}