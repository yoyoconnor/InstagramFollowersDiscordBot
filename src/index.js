const connectDB = require("./db/connection");
const Entry = require("./db/schema");
const express = require('express');
const app = express();
const {Client, IntentsBitField} = require('discord.js');
require('dotenv').config();
const session = require('express-session');
const encryptData = require('./encryption.js');

app.use(session({
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: true
    }));

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on('ready', (c) => {
    console.log(`Logged in as ${c.user.tag}!`);
})

client.on('messageCreate', (msg) => {
    if(msg.content===('!verify')){
    //get author id
    const id=msg.author.id;
    const username=msg.author.username;
    const globalName=msg.author.globalName;

    console.log(`id: ${id}, ${globalName}(${username})`);
    //send dm to author
    //hash function
    encryptData(id, process.env.SECRET_KEY).then(async (encrypted) => {
        msg.author.send(`${process.env.HOST_URL}/verify/?id=${encrypted}`);
        console.log('bigtest')
        try {
          const existingEntry = await Entry.findOne({ discordId: id });
      
          if (existingEntry) {
            existingEntry.encryptedIds.push(encrypted);
            await existingEntry.save();
          } else {
            const newEntry = new Entry({
              encryptedId: encrypted,
              discordId: id,
              discordTag: username,
              instagramId: null,
              instagramUsername: null,
            });
            await newEntry.save();
          }
        } catch (err) {
          console.error(err);
        }
      });
    }});