const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://jimmytest:jimmytest@cluster0.mp5sxzd.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Access collections directly by name from safe_browsing_db
const connection = mongoose.connection.useDb('safe_browsing_db');

const Blacklist = connection.collection("blacklist");
const FlaggedWord = connection.collection("flagged_words");

// POST /check
app.post("/check", async (req, res) => {
    const { url, content } = req.body;
    if (!url || !content) return res.status(400).json({ error: "Missing url or content" });

    try {
        // Case-insensitive URL match
        const urlMatch = await Blacklist.findOne({
            url: { $regex: new RegExp(`^${url}$`, 'i') }
        });

        if (urlMatch) return res.json({ match: true, reason: "blacklist" });

        // Check flagged word count
        const flaggedWordsCursor = await FlaggedWord.find({});
        const flaggedWords = await flaggedWordsCursor.toArray();
        const wordList = flaggedWords.map(w => w.word.toLowerCase());

        let count = 0;
        const contentLower = content.toLowerCase();

        for (const word of wordList) {
            if (contentLower.includes(word)) count++;
            if (count > 6) break;
        }

        if (count > 6) {
            return res.json({ match: true, reason: "flagged_words" });
        } else {
            return res.json({ match: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start server
app.listen(3000, () => {
    console.log("🟢 Backend running on http://localhost:3000");
});
