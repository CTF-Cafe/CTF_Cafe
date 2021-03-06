# Features

- Create your own challenges, files, hints, code snippets and flags from the admin dashboard
  - File uploads to the server
  - Flag submit bruteforce protection
- Individual and Team based competitions
  - Have users play on their own or form teams to play together
  - First blood's
- Scoreboard with automatic tie resolution
  - See global user, team and challenge stats
  - See indivudal team & user stats
- Automatic competition starting and ending
  - Easily set endTime & startTime from the admin dashboard
- Team and user management, and banning
- Customize site colors, background, rules & frontpage
- Importing and Exporting of CTF scoreboards into json
- And more...


# Auto Infrastructure Setup

[Script](https://github.com/CTF-Cafe/CTF_Cafe/blob/e39322de4278d190e9b7ec6908e59763b2588435/serverSetupScript.sh)

Make sure to create a new account, promote him to admin and delete the admin:admin user after setup!

# Manual Backend & Frontend Setup

## Prerequisites
- Node.JS
- MongoDB
- Visual Studio Code or another IDE (not Notepad)

## Setup
- Make a `.env` file on /backEnd/ in this format:
```
SECRET_KEY=<secure randomly generated session key for validating session cookies>
MONGODB_CONNSTRING=<mongodb connect URI, e.g. "mongodb://localhost:27017" - you may need to surround it in quotes if you experience glitches or formatting issues>
NODE_ENV=<development/production>
FRONTEND_URI=<frontend url>
```

- Make a `.env` file on /frontEnd/ in this format:
```
REACT_APP_SERVER_URI=<your backend url that has the /api pages and functions, e.g. http://localhost:3001>
REACT_APP_CTF_NAME=<ctf_name_formatted_like_this>
GENERATE_SOURCEMAP=<true for dev | false for production>
```

## Startup

`MongoDB`
- Start your mongoDB database
- If you're testing on Windows, you may need to download https://www.mongodb.com/try/download/community

`/frontEnd`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` or `npm run start-react` for easier dev to start the frontend

`/backEnd`
- Run `npm install` to install the requirements from `package.json`, then run `npm start` to start & setup the backend

`/discordBot`
- This is optional, but can be used to setup a bot for the CTF. See here: https://github.com/CTF-Cafe/CTF_Cafe/tree/master/discordBot

Make sure to create a new account, promote him to admin and delete the admin:admin user after setup!

Good to go!
