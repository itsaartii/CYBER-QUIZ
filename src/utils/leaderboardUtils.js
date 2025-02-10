// Load initial data from localStorage or use default empty leaderboard
let leaderboardData = (() => {
  const savedData = localStorage.getItem('leaderboardData');
  if (savedData) {
    return JSON.parse(savedData);
  }
  return {
    leaderboards: {
      beginner: {
        daily: [],
        weekly: [],
        allTime: []
      },
      intermediate: {
        daily: [],
        weekly: [],
        allTime: []
      },
      advanced: {
        daily: [],
        weekly: [],
        allTime: []
      }
    }
  };
})();

// Calculate points based on score and time spent
export const calculatePoints = (score, timeSpent, difficulty) => {
  const basePoints = score * 10;
  const timeBonus = Math.max(0, 300 - timeSpent) / 2;
  const difficultyMultiplier = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
  }[difficulty] || 1;
  
  return Math.round((basePoints + timeBonus) * difficultyMultiplier);
};

// Save score to leaderboard
export const saveScore = (playerName, score, totalQuestions, timeSpent, difficulty) => {
  const points = calculatePoints(score, timeSpent, difficulty);
  const newEntry = {
    player: playerName,
    score,
    total: totalQuestions,
    timeSpent,
    points
  };

  // Add to daily leaderboard
  leaderboardData.leaderboards[difficulty].daily.push(newEntry);
  leaderboardData.leaderboards[difficulty].daily.sort((a, b) => b.points - a.points);
  leaderboardData.leaderboards[difficulty].daily = leaderboardData.leaderboards[difficulty].daily.slice(0, 10);

  // Add to weekly leaderboard
  leaderboardData.leaderboards[difficulty].weekly.push(newEntry);
  leaderboardData.leaderboards[difficulty].weekly.sort((a, b) => b.points - a.points);
  leaderboardData.leaderboards[difficulty].weekly = leaderboardData.leaderboards[difficulty].weekly.slice(0, 10);

  // Add to all-time leaderboard
  leaderboardData.leaderboards[difficulty].allTime.push(newEntry);
  leaderboardData.leaderboards[difficulty].allTime.sort((a, b) => b.points - a.points);
  leaderboardData.leaderboards[difficulty].allTime = leaderboardData.leaderboards[difficulty].allTime.slice(0, 10);

  // Save to localStorage
  localStorage.setItem('leaderboardData', JSON.stringify(leaderboardData));
  
  return {
    points,
    rank: getRank(points, difficulty)
  };
};

// Get player's rank based on points
const getRank = (points, difficulty) => {
  const allTimeScores = leaderboardData.leaderboards[difficulty].allTime;
  return allTimeScores.findIndex(entry => entry.points <= points) + 1;
};

// Load leaderboard data
export const loadLeaderboardData = () => {
  const savedData = localStorage.getItem('leaderboardData');
  if (savedData) {
    leaderboardData = JSON.parse(savedData);
  }
  return leaderboardData;
};

// Get leaderboard for specific difficulty and time period
export const getLeaderboard = (difficulty, period) => {
  return leaderboardData.leaderboards[difficulty][period] || [];
}; 