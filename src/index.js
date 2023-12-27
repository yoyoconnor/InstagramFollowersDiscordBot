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