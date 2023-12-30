# DoUfollowMii?
Discord Bot gatekeeper: Only Instagram followers allowed.

by Connor, Irfan, and Daniel

## Devpost
https://devpost.com/submit-to/20029-brooklynhacks/manage/submissions/463636-doufollowmii/finalization

## Inspiration
We wanted to only allow followers of a specific Instagram influencer into their community discord.
## What it does
Prompts newcomers to sign into their Instagram account using OAuth and gives "follower" role to access the rest of the server. The Discord Bot runs a following check periodically to make sure community members are still following.
## Challenges we ran into
The biggest challenge was getting the list of followers periodically as it is not in the meta developer portal.
## What's next for DoUfollowMii?
The bot will take away your server access if you unfollow.

## Technology stack
- React
- Express
- MongoDB
- DiscordBot
- Instagram OAuth
- HTML/CSS

## Requirements
- Meta Developer Account
- Discord Developer Account
- MongoDB Account

## env
```
DISCORD_TOKEN=
HOST_URL=
SECRET_KEY=
MONGO_URI=
INSTAGRAM_CLIENT_ID=
EXPRESS_SECRET=
INSTAGRAM_CLIENT_SECRET=
SECRET_KEY=
DISCORD_GUILD_ID=
```

## How to run
- MongoDB instance
- npm i
- npm run start
