import { Thread } from "../models/thread.model.js";
import { Board } from "../models/Board.model.js";

export const getThread = async (req, res) => {
    const { board } = req.params;

    try {
        const boardDB = await Board.findOne({ name: board }).populate(
            {
                path: 'threads',
                options: {
                    sort: { bumped_on: -1 },
                    limit: 10,
                    select: '-delete_password -reported'
                },
                populate: {
                    path: 'replies',
                    options: { sort: { bumped_on: -1 }, limit: 3, select: '-delete_password -reported' }
                }
            }
        );
        if (!boardDB) {
            return res.status(404).json({ error: "Board not found" });
        }

        res.status(200).json(boardDB.threads);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export const addThread = async (req, res) => {
    const { board } = req.params;
    const { text, delete_password } = req.body;

    try {
        const newThread = new Thread({
            text,
            delete_password
        })
        await newThread.save();

        let boardDB = await Board.findOne({ name: board });
        if (!boardDB) {
            boardDB = new Board({
                name: board,
                threads: [newThread._id]
            })
            await boardDB.save();
        }
        else {
            boardDB.threads.push(newThread._id);
            await boardDB.save();
        }

        res.status(200).json(newThread);
    } catch (error) {
        console.log("Error adding thread", error);
        res.status(500).json({ error: "Server error" });
    }
}

export const reportThread = async (req, res) => {
    const { board } = req.params;
    const { report_id, thread_id } = req.body;
    let id = report_id || thread_id;

    try {
        const thread = await Thread.findById(id);
        if (!thread) {
            console.log("Thread not found");
            return res.status(404).json("Thread not found");
        }

        thread.reported = true;
        await thread.save();

        console.log("reported");
        res.status(200).send("reported");
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}

export const deleteThread = async (req, res) => {
    const { board } = req.params;
    const { thread_id, delete_password } = req.body;

    try {
        const thread = await Thread.findById(thread_id);
        if (!thread) {
            console.log("Thread not found");
            return res.status(404).json("Thread not found");
        }

        if (thread.delete_password !== delete_password) {
            return res.status(403).send("incorrect password");
        }

        await Board.findOneAndUpdate(
            { name: board },
            { $pull: { threads: thread_id } }
        );

        await Thread.findByIdAndDelete(thread_id);

        console.log("success");
        res.status(200).send("success");

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}