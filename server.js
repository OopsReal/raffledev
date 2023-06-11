const express = require("express");
var bodyParser = require('body-parser');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const axios = require('axios');
const dotenv = require('dotenv');
const path = require("path");
dotenv.config();
app.use(express.static("public"));
const { IgApiClient, LiveEntity } = require('instagram-private-api');
const Bluebird = require('bluebird');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
server.listen(PORT, () => {
   console.log(`listening on *:${PORT}`);
  })

//routes
app.get('/raffle', (req, res) => {
   res.sendFile(path.join(__dirname, "public", "raffle.html"));
})
app.get('/leaderboard', (req, res) => {
   res.sendFile(path.join(__dirname, "public", "leaderboard.html"));
})




//login to instagram

const ig = new IgApiClient();
async function login() {
   ig.state.generateDevice(process.env.IG_USERNAME);
   //ig.state.proxyUrl = process.env.IG_PROXY;
   await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
 }
//login();

/*  Raffle server code      -----------------------------------------------------------------------------------------------*/


// Replace 'YOUR_ACCESS_TOKEN' with your actual access token
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const getBroadcastId = async () => {
   try {
     const response = await axios.get('https://rtmp.in/' + ACCESS_TOKEN + '/info');
 
     if (response.status === 200) {
       const data = response.data;
       if (data.status === 'ok' && data.broadcast) {
         const broadcastId = data.broadcast.id;
         return broadcastId;
       } else {
         console.log('No broadcast found or status is not "ok".');
       }
     } else {
       console.log('Error:', response.status, response.data);
     }
   } catch (error) {
     console.error('Error:', error.message);
   }
 };


 app.post('/startraffle',function(){
   getBroadcastId()
   .then(broadcastId => {
     if(broadcastId) {
     (async () => {
     let viewersObj = await ig.live.getViewerList(broadcastId);
     const usernames = [];
     for (let i = 0; i < viewersObj.users.length; i++) {
      // Access the username property and push it to the usernames array
      usernames.push(viewersObj.users[i].username);
    }
    // console.log('broadcast id:', broadcastId);
    // console.log('Current viewers:', usernames);
     io.emit("startraffle", usernames);
     // now you're basically done
     })();
     return;
   }
     io.emit("startraffle");
   })
   .catch(error => {
     console.error('Error:', error.message);
   });
 });
 

app.post('/stopraffle',function(){
   io.emit("stopraffle")
});

/*  Leaderbaords server code      -----------------------------------------------------------------------------------------------*/


// Set up initial leaderboard data
let leaderboard = [
   { id: 1, name: '@AshleyGen', score: 0, image: 'assets/leaderboard/player1.png', voters: [] },
   { id: 2, name: '@PMorganB', score: 0, image: 'assets/leaderboard/player2.png', voters: [] },
   { id: 3, name: '@AnayaSmith', score: 0, image: 'assets/leaderboard/player3.png', voters: [] },
   { id: 4, name: '@ThaOneUWant', score: 0, image: 'assets/leaderboard/player4.png', voters: [] },
   { id: 5, name: '@RealnessBrian', score: 0, image: 'assets/leaderboard/player5.png', voters: [] },
   { id: 6, name: '@JamesB', score: 0, image: 'assets/leaderboard/player6.png', voters: [] },
   { id: 7, name: '@MichaelBJordan', score: 0, image: 'assets/leaderboard/player7.png', voters: [] },
   { id: 8, name: '@SpanishMami', score: 0, image: 'assets/leaderboard/player8.png', voters: [] },
 ];

// Socket.io connection
io.on('connection', (socket) => {
   // Send leaderboard data to the client
   socket.emit('leaderboard', leaderboard);
 
   // Handle score updates
   socket.on('updateScore', (data) => {
     const { player, voter } = data;
 
     // Find the player in the leaderboard
     const playerToUpdate = leaderboard.find((p) => p.name === player);
  
     if (playerToUpdate) {
       // Check if the voter has already voted for this player
       if (!playerToUpdate.voters.includes(voter)) {
         // Increment the player's score by 1
         playerToUpdate.score += 1;
 
         // Add the voter to the list of voters for this player
         playerToUpdate.voters.push(voter);
 
         // Sort the leaderboard based on scores
         leaderboard.sort((a, b) => b.score - a.score);
 
         // Get the updated player's index
         const index = leaderboard.findIndex((p) => p.name === player);
 
         // Prepare the leaderboard data to send to the client
         const updatedLeaderboard = leaderboard.map((p, i) => ({
           ...p,
           position: i + 1,
         }));

         // Emit the updated leaderboard, the ID of the updated player, and the ID of the player that was overtaken
         io.emit('scoreUpdated', { leaderboard: updatedLeaderboard, updatedPlayerId: playerToUpdate.id, overtakenPlayerId: leaderboard[index + 1].id });
       }
     }
   });
 });


 app.post('/leaderupdate', (req, res) => {
  const { player, voter } = req.body;

  // Find the player in the leaderboard
  const playerToUpdate = leaderboard.find((p) => p.name === player);

  if (playerToUpdate) {
    // Check if the voter has already voted for this player
    if (!playerToUpdate.voters.includes(voter)) {
      // Increment the player's score by 1
      playerToUpdate.score += 1;

      // Add the voter to the list of voters for this player
      playerToUpdate.voters.push(voter);

      // Sort the leaderboard based on scores
      leaderboard.sort((a, b) => b.score - a.score);

      // Get the updated player's index
      const index = leaderboard.findIndex((p) => p.name === player);

      // Prepare the leaderboard data to send to the client
      const updatedLeaderboard = leaderboard.map((p, i) => ({
        ...p,
        position: i + 1,
      }));

      // Emit the updated leaderboard, the ID of the updated player, and the ID of the player that was overtaken
      io.emit('scoreUpdated', { leaderboard: updatedLeaderboard, updatedPlayerId: playerToUpdate.id, overtakenPlayerId: leaderboard[index + 1].id });
    }
  }

  res.sendStatus(200);
});

















