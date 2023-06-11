import React from 'react';
import ReactDOM from 'react-dom';
import FlipMove from 'react-flip-move';
const io = require('socket.io-client');

// Import the slap sound file
import slapSound from '../assets/leaderboard/slap.mp3';

const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('leaderboard', (leaderboard) => {
  updateLeaderboard(leaderboard);
});

socket.on('scoreUpdated', (data) => {
  const { leaderboard } = data;
  updateLeaderboard(leaderboard);
});

function updateLeaderboard(leaderboard) {
  const numberedLeaderboard = leaderboard.map((player, index) => ({
    ...player,
    position: index + 1,
  }));
  ReactDOM.render(
    <FlipMove typeName="ul" className="leaderboard" onFinishAll={handleAnimationFinish}>
      {numberedLeaderboard.map((player) => (
        <li key={player.id} className="player">
          <span className="position">{player.position}</span>
          <div className="inner">
          <div className="inneruser">
          <div className="imgwrap">
          <img src={player.image} alt={player.name} />
          </div>  
          <div className="namewrap">
          <span className="name">{player.name}</span>
          </div>
          </div>
          <span className="score">{player.score}</span>
          </div>
        </li>
      ))}
    </FlipMove>,
    document.getElementById('leaderboard')
  );
}

function handleAnimationFinish(childElements,domNodes) {
  const firstLi = document.querySelector('.leaderboard li:first-child');
  const isFirstLiInArray = Array.from(domNodes).includes(firstLi);

  if (isFirstLiInArray) {
    // Play the slap sound effect
    const audio = new Audio(slapSound);
    audio.play();
  }
}