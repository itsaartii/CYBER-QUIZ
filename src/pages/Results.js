import React, { useState } from 'react';
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
import leaderboardData from '../data/leaderboard.json';

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
      // Here you would typically save the score to your backend
      // For now, we'll just close the dialog
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
        }}
      >
        Quiz Results
      </Typography>

      <Paper
        elevation={3}
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
            sx={{
              color: percentage >= 60 ? 'success.main' : 'warning.main',
            }}
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
              color="text.secondary"
            >
              {percentage}%
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" gutterBottom>
          {feedback.emoji} {feedback.message}
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          You scored {score} out of {total} questions correctly
        </Typography>

        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Time: {formatTime(timeSpent)}
          </Typography>
          <Typography variant="subtitle1" color="success.main" gutterBottom>
            Time Bonus: +{timeBonus} points
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Total Points: {points} / {maxPoints + timeBonus}
          </Typography>
        </Box>

        {earnedBadge && (
          <Card
            sx={{
              mt: 3,
              mb: 3,
              backgroundColor: 'background.default',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Badge Earned!
              </Typography>
              <Typography variant="h4" gutterBottom>
                {earnedBadge[1].icon}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {earnedBadge[1].name}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Divider sx={{ my: 3 }} />

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
            >
              Save Score to Leaderboard
            </Button>
          </Grid>
          <Grid item xs={12}>
            <ShareButton text={shareText} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate('/quiz', { state: { difficulty } })}
              sx={{ mb: { xs: 2, sm: 0 } }}
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

      <Dialog open={showNameDialog} onClose={() => setShowNameDialog(false)}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNameDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveScore} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Results; 