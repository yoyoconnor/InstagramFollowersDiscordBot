const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    encryptedIds: { type: Array, required: true},
    discordId: { type: String, required: true },
    discordTag: { type: String, required: true },
    instagramId: { type: String, required: false },
    instagramUsername: { type: String, required: false },
});
  
const Entry = mongoose.model("Entry", schema);

module.exports = Entry;