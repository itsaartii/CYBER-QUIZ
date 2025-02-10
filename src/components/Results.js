import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveScore } from '../utils/leaderboardUtils';
import '../styles/Results.css';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [leaderboardStats, setLeaderboardStats] = useState(null);

  const { score, totalQuestions, timeSpent, difficulty } = location.state || {
    score: 0,
    totalQuestions: 0,
    timeSpent: 0,
    difficulty: 'beginner'
  };

  const handleSaveScore = () => {
    if (playerName.trim()) {
      const stats = saveScore(playerName, score, totalQuestions, timeSpent, difficulty);
      setLeaderboardStats(stats);
      setShowNameInput(false);
    }
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="results-container">
      <h1>Quiz Results</h1>
      <div className="results-card">
        <div className="score-info">
          <p>Score: {score}/{totalQuestions}</p>
          <p>Time Spent: {formatTime(timeSpent)}</p>
          <p>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
        </div>

        {showNameInput ? (
          <div className="name-input-section">
            <p>Enter your name to save your score:</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your Name"
              className="name-input"
            />
            <button onClick={handleSaveScore} className="save-score-btn">
              Save Score
            </button>
          </div>
        ) : (
          <div className="leaderboard-stats">
            <p>Points Earned: {leaderboardStats.points}</p>
            <p>Your Rank: #{leaderboardStats.rank}</p>
          </div>
        )}

        <button onClick={handlePlayAgain} className="play-again-btn">
          Play Again
        </button>
      </div>
    </div>
  );
};

export default Results; 