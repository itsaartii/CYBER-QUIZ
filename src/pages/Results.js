import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import quizData from '../data/questions.json';
import Leaderboard from '../components/Leaderboard';
import { saveScore, loadLeaderboardData } from '../utils/leaderboardUtils';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function ShareButton({ text }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My CyberQuiz Results',
          text: text,
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={handleShare}
      sx={{ mt: 2 }}
    >
      Share Results
    </Button>
  );
}

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    score = 0,
    total = 5,
    difficulty = 'beginner',
    points = 0,
    maxPoints = 50,
    timeSpent = 0,
    timeBonus = 0,
  } = location.state || {};

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [leaderboardData, setLeaderboardData] = useState(loadLeaderboardData());

  const percentage = Math.round((score / total) * 100);
  const pointsPercentage = Math.round((points / maxPoints) * 100);

  const badges = quizData.badges[difficulty];
  const earnedBadge = Object.entries(badges).reverse().find(
    ([_, badge]) => points >= badge.requirement
  );

  const getFeedback = () => {
    if (percentage >= 80) {
      return {
        message: "Excellent! You're mastering cybersecurity!",
        emoji: "🏆",
      };
    } else if (percentage >= 60) {
      return {
        message: "Good job! You have a solid understanding of security concepts.",
        emoji: "👍",
      };
    } else {
      return {
        message: "Keep learning! Security is a journey of continuous improvement.",
        emoji: "📚",
      };
    }
  };

  const handleSaveScore = () => {
    if (playerName.trim()) {
      // Save score and update leaderboard data
      saveScore(playerName, score, total, timeSpent, difficulty);
      // Reload the leaderboard data to show the updated scores
      setLeaderboardData(loadLeaderboardData());
      setShowNameDialog(false);
    }
  };

  const feedback = getFeedback();
  const shareText = `I just completed the ${difficulty} CyberQuiz!\n${feedback.emoji} Score: ${score}/${total} (${percentage}%)\nTime: ${formatTime(timeSpent)}\n${earnedBadge ? `Earned: ${earnedBadge[1].name} ${earnedBadge[1].icon}` : ''}\nTest your cybersecurity knowledge too!`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        maxWidth: 'md',
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        align="center"
        sx={{
          mb: 2,
          fontSize: { xs: '2rem', sm: '3rem' },
          fontWeight: 600,
        }}
      >
        Quiz Results
      </Typography>

      <Paper
        elevation={3}
        className="results-paper"
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
            mb: 3,
          }}
        >
          <CircularProgress
            variant="determinate"
            value={pointsPercentage}
            size={120}
            thickness={4}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 'bold' }}
            >
              {percentage}%
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
          {feedback.emoji} {feedback.message}
        </Typography>

        <Typography variant="h6" color="textSecondary" gutterBottom>
          You scored {score} out of {total} questions correctly
        </Typography>

        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Time: {formatTime(timeSpent)}
          </Typography>
          <Typography variant="subtitle1" className="success-text" gutterBottom>
            Time Bonus: +{timeBonus} points
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Total Points: {points} / {maxPoints + timeBonus}
          </Typography>
        </Box>

        {earnedBadge && (
          <Card
            className="badge-card"
            sx={{
              mt: 3,
              mb: 3,
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Badge Earned!
              </Typography>
              <Typography variant="h4" gutterBottom>
                {earnedBadge[1].icon}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {earnedBadge[1].name}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Divider className="results-divider" sx={{ my: 3 }} />

        <Grid
          container
          spacing={2}
          sx={{
            mt: 2,
            justifyContent: 'center',
          }}
        >
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setShowNameDialog(true)}
              sx={{ py: 1.5 }}
            >
              Save Score to Leaderboard
            </Button>
          </Grid>
          <Grid item xs={12}>
            <ShareButton text={shareText} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => navigate('/quiz')}
              sx={{ py: 1.5 }}
            >
              Try Again
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => navigate('/')}
              sx={{ py: 1.5 }}
            >
              Back to Home
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Leaderboard
        data={leaderboardData.leaderboards[difficulty]}
        difficulty={difficulty}
      />

      <Dialog
        open={showNameDialog}
        onClose={() => setShowNameDialog(false)}
        PaperProps={{
          className: "MuiDialog-paper"
        }}
      >
        <DialogTitle>Save Your Score</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Name"
            type="text"
            fullWidth
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNameDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveScore} 
            color="primary" 
            variant="contained"
            disabled={!playerName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Results; 