const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://jimmytest:jimmytest@cluster0.mp5sxzd.mongodb.net/";
const client = new MongoClient(uri);

async function showFlaggedWords() {
  try {
    await client.connect();
    const db = client.db("safe_browsing_db");
    const words = await db.collection("flagged_words").find().toArray();

    console.log("\n🧨 Flagged Words:");
    words.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.word}`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

showFlaggedWords();
