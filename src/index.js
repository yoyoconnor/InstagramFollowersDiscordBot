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

app.get('/verify/', (req, res) => {
    //add unique hashid
    session.encryptedId=req.query.id;
    console.log(`initialsession ${session}`);
    //decode hashid to discord id
    //get discord id
    //
    // Find the entry and update session properties
    Entry.findOne({ encryptedId: session.encryptedId })
.then(entry => {
  session.discordId = entry.discordId;
  session.discordTag = entry.discordTag;
  console.log(`Session after adding discord: ${JSON.stringify(session)}`);
})
.catch(err => {
  // Handle error
  console.error(err);
});

// Remove hashid from mongo
Entry.findOne({ encryptedId: session.encryptedId })
.then(entry => {
  entry.encryptedIds.pull(session.encryptedId);
  return entry.save();
})
.then(() => {
  console.log(`Session after removed hash: ${JSON.stringify(session)}`);
})
.catch(err => {
  // Handle error
  console.error(err);
});
    //send instagram basic display api
  res.redirect(`https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.HOST_URL}/auth/callback/&scope=user_profile,user_media&response_type=code`);
});

app.get('/auth/callback', (req, res) => {
    session.code=req.query.code;
    //get instagram id
    //store in mongo
    //send dm to user
    async function callback() {
      let response = await fetch('https://api.instagram.com/oauth/access_token', {
          method: 'POST',
          body: new URLSearchParams({
              'client_id': `${process.env.INSTAGRAM_CLIENT_ID}`,
              'client_secret': `${process.env.INSTAGRAM_CLIENT_SECRET}`,
              'grant_type': 'authorization_code',
              'redirect_uri': 'https://sudocrm.onrender.com/auth/callback/',
              'code': `${session.code}`,
          })
      });
      // let response2 = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${response.access_token}`)
      let idandaccess = await response.json();
      let resposne = await (await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${idandaccess.access_token}`)).json();
      
      //check if user follows sudo 0=unknown 1=nonfollower 2=follower
      session.instagramId=resposne.id;
      session.instagramUsername=resposne.username;
      //add instagram id to mongo
      Entry.findOne({ discordId: session.discordId })
      .then(entry => {
        entry.instagramId = session.instagramId;
        entry.instagramUsername = session.instagramUsername;
        return entry.save();
      })
      console.log(session);
  }
  callback();
  res.send(`your discord `);
});

app.get('/entries', async (req, res) => {
    try {
      const entries = await Entry.find();
      if(entries.length === 0) {
        res.send('No entries found');
        return;
      }
      console.log(entries);
      console.log(entries[0].encryptedIds);
      res.json(entries);
    } catch (err) {
      console.error(err);
    }
  });
  
  app.get('/deleteall', async (req, res) => {
    try {
      await Entry.deleteMany({});
      console.log('Collection removed');
      res.send('Deleted');
    } catch (err) {
      console.error('Error removing documents:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.listen(3000, () => {
    console.log('Express server is running on port 3000');
  });

