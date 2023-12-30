const {Client, IntentsBitField} = require('discord.js');
require('dotenv').config();
const encryptData = require('./encryption.js');
const express = require('express');
const app = express();
const connectDB = require("./db/connection");
const Entry = require("./db/schema");
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
connectDB();
//const listOfFollowers = JSON.parse(fs.readFileSync('followers.json', 'utf8'));
let listOfFollowers = ['yoyoconnor69','connorcodes']
let adminKeys=[];
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
    if(msg.content===('!adminLogin')){
        if(process.env.ADMIN_IDS.includes(msg.author.id)){
            //generate key
            const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            //add key to adminKeys
            //add time created to adminKeys
            adminKeys.push({
                key: key,
                time: Date.now()
            });
            msg.author.send(`${process.env.HOST_URL}/uploadfollowers/?key=${key}`);
        }
        else{
            msg.reply('you are not an admin');
        }
    }
    if(msg.content===('!verify')){
    //get author id
    console.log(JSON.stringify(msg));
    const id=msg.author.id;
    const username=msg.author.username;
    const globalName=msg.author.globalName;

    console.log(`id: ${id}, ${globalName}(${username})`);
    //send dm to author
    //hash function
    encryptData(id, process.env.SECRET_KEY).then(async (encrypted) => {
        try {
          const encryptedData=encrypted;
          msg.author.send(`${process.env.HOST_URL}/verify/?id=${encryptedData}`);
          console.log(`initial encrypted: ${encryptedData}`)
          const existingEntry = await Entry.findOne({ discordId: id });
          if (!existingEntry) {
            const entry = new Entry({
              hash: 'initial',
              discordId: id,
              discordTag: `${globalName}(${username})`,
            });
            console.log('new entry created');
            console.log(entry);
            entry.hash=encryptedData;
            console.log('entry encrypted');
            console.log(entry);
            await entry.save();
            console.log('entry saved');
          }
          else{
          Entry.findOne({ discordId: id })
          .then(async entry => {
            if (!entry) {
              console.log('no entry found');
              return;
            }
            entry.hash=encryptedData;
            await entry.save();
          })
        }

        } catch (err) {
          console.error(err);
        }
      });
      
    }});
    
    

app.get('/verify/', (req, res) => {
    //add unique hashid
    session.encryptedId=req.query.id;
    //decode hashid to discord id
    //get discord id
    //
    // Find the entry and update session properties
    
    Entry.findOne({ hash: session.encryptedId })
    .then(entry => {
      if (entry) {
        session.discordId = entry.discordId;
        session.discordTag = entry.discordTag;
      } else {
        console.log("No matching entry found for encryptedId:", session.encryptedId);
      }
    })
    .catch(error => {
      console.error("Error during findOne operation:", error);
    });

// Remove hashid from mongo
console.log(`encryptedId: ${session.encryptedId}`);



    //send instagram basic display api
   
  res.redirect(`https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.HOST_URL}/auth/callback/&scope=user_profile,user_media&response_type=code`);
});

app.get('/auth/callback', async (req, res) => {
  session.code = req.query.code;
  async function callback() {
      try {
        await Entry.findOne({ hash: session.encryptedId })
        .then(entry => {
          if (!entry) {
            console.log('no entry found');
            return;
          }
          entry.hash = 'removed'
          return entry.save();
        })
        .catch(err => {
          // Handle error
          console.error(err);
        });
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

          let idandaccess = await response.json();
          let resposne = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${idandaccess.access_token}`);
          resposne = await resposne.json();

          //check if user follows sudo 0=unknown 1=nonfollower 2=follower
          session.instagramId = resposne.id;
          session.instagramUsername = resposne.username;

          console.log(`session after callback: ${JSON.stringify(session)}`);

          // Use the async version of findOne
          Entry.findOne({ discordId: session.discordId })
          .then(async entry => {
            if (!entry) {
              console.log('no entry found');
              return;
            }
            else
            {


          entry.instagramId = session.instagramId;
          entry.instagramUsername = session.instagramUsername;
          entry.isFollower = await isFollower(session.instagramUsername);
          await entry.save();
          // Add the necessary logic to obtain the 'message' object
          // For example: const message = ...;

          // Add discord role
          if(entry.isFollower){
          const discordServer= client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
          const user = discordServer.members.cache.get(session.discordId);
          const role = discordServer.roles.cache.find((r) => r.name === 'Follower');
          console.log(`discordServer: ${discordServer}, user: ${user}, role: ${role}`);
          // Assign the role to the user
          user.roles.add(role);
          }
          else{
            res.send('youre not a follower');
          }
            }
          })
          .catch(err => {
            // Handle error
            console.error(err);
          });
      } catch (error) {
          console.error(error); // Handle any errors that might occur during the process
      }
  }

  await callback(); // Wait for the callback function to complete
  res.sendFile(__dirname + '/pages/mvp-index.html');
});

isFollower = async (username) => {
    return listOfFollowers.includes(username);
}
app.get('/uploadfollowers', (req, res) => {
  session.key=req.query.key;
  //check if key is valid
  let keyIsValid=false;
  if((adminKeys.map(element=>element.key).includes(req.body.key))){
    keyIsValid=true;
  }
  //if not valid return
  if(!keyIsValid){
    res.send('invalid key');
    return;
  }
  else{
  res.sendFile(__dirname + '/pages/upload.html');
  }
}
);


// Set up multer storage
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

app.post('/uploadfollowers', upload.single('jsonFile'), (req, res) => {
  //check if user possesses admin key
  if(!(adminKeys.map(element=>element.key).includes(req.body.key))){
    res.send('invalid key');
    return;
  }
  else{
    //remove key from adminKeys
    adminKeys = adminKeys.filter(item => item.key !== req.body.key);
  }



  // Access the uploaded file using req.file
  let tempkey=req.body.key;
  const fileBuffer = req.file.buffer;
  const fileContent = fileBuffer.toString('utf-8'); // Convert buffer to string

  // Process the fileContent as needed
  console.log(listOfFollowers);
  listOfFollowers = JSON.parse(fileContent).map(item => item.string_list_data[0].value);
  console.log(listOfFollowers);
  //download list of followers to followers.json
  fs.writeFile('followers.json', JSON.stringify(listOfFollowers), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
  //refresh checks of users against new list of followers

  Entry.find()
  .then( entries => {
    entries.forEach(entry => async () =>{
      entry.isFollower = await isFollower(entry.instagramUsername);
      console.log(await entry.isFollower);
      if(await isFollower(entry.instagramUsername)){
        console.log(entry.instagramUsername)
       console.log('is a follower');

    // Check if user and role exist
      const discordServer= client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      const user = discordServer.members.cache.get(entry.discordId);
      const role = discordServer.roles.cache.find((r) => r.name === 'Follower');
      console.log(`discordServer: ${discordServer}, user: ${user}, role: ${role}`);
      // Assign the role to the user
      user.roles.add(role);
      }
      entry.save();
    });
  })
  .catch(err => {
    console.error(err);
  }
  );
  //asdign roles

  




  // Respond to the client
  res.status(200).send('File uploaded successfully');
});

port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/test', (req, res) => {
    res.send('test');
  });
  
  app.get('/entries', async (req, res) => {
    try {
      const entries = await Entry.find();
      if(entries.length === 0) {
        res.send('No entries found');
        return;
      }
      console.log(entries);
      console.log(entries[0].hash);
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
  app.get('/listoffollowers', async (req, res) => {
    try {
      res.json(listOfFollowers);
    } catch (err) {
      console.error(err);
    }
  }
  );

  app.get('/adminkeys', async (req, res) => {
    try {
      res.json(adminKeys);
    } catch (err) {
      console.error(err);
    }
  }
  );
  app.get('/userdata', async (req, res) => {
    try {
      console.log(`session: ${JSON.stringify(session)}`);
      res.json(
        {
          discordTag: session.discordTag,
          instagramUsername: session.instagramUsername,
        }
      );
    } catch (err) {
      console.error(err);
    }
  }
  );
  
  app.listen(3000, () => {
    console.log('Express server is running on port 3000');
  });
//display all mongo entries



//a

client.login(process.env.DISCORD_TOKEN);