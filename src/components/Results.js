import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import {
  Share as ShareIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Download as DownloadIcon,
  WorkspacePremium as ExpertIcon,
  Psychology as ProfessionalIcon,
  School as EnthusiastIcon,
  EmojiObjects as LearnerIcon,
} from '@mui/icons-material';
import { saveScore, getLeaderboard } from '../utils/leaderboardUtils';
import '../styles/Results.css';

// Badge configurations based on score percentage
const BADGE_CONFIG = {
  expert: {
    threshold: 90,
    title: 'Cybersecurity Expert',
    color: '#FFD700', // Gold
    icon: ExpertIcon,
    backgroundColor: '#FFF9C4' // Light gold
  },
  advanced: {
    threshold: 75,
    title: 'Security Professional',
    color: '#C0C0C0', // Silver
    icon: ProfessionalIcon,
    backgroundColor: '#F5F5F5' // Light silver
  },
  intermediate: {
    threshold: 60,
    title: 'Security Enthusiast',
    color: '#CD7F32', // Bronze
    icon: EnthusiastIcon,
    backgroundColor: '#FFE0B2' // Light bronze
  },
  beginner: {
    threshold: 0,
    title: 'Security Learner',
    color: '#4CAF50', // Green
    icon: LearnerIcon,
    backgroundColor: '#E8F5E9' // Light green
  }
};

const getFeedbackMessage = (percentage) => {
  if (percentage >= 90) return "Outstanding! You've demonstrated expert-level knowledge in cybersecurity.";
  if (percentage >= 75) return "Great job! You show strong understanding of security concepts.";
  if (percentage >= 60) return "Good effort! You're building a solid foundation in cybersecurity.";
  return "Keep learning! Every security journey starts with the basics.";
};

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('daily');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Safe state extraction with validation
  const safeLocationState = location?.state || {};
  const score = Math.max(0, parseInt(safeLocationState.score) || 0);
  const totalQuestions = Math.max(10, parseInt(safeLocationState.totalQuestions) || 10);
  const timeSpent = Math.max(0, parseInt(safeLocationState.timeSpent) || 0);
  const difficulty = ['beginner', 'intermediate', 'advanced'].includes(safeLocationState.difficulty) 
    ? safeLocationState.difficulty 
    : 'beginner';

  // Safe percentage calculation
  const scorePercentage = Math.min(100, (score / totalQuestions) * 100);

  // Safe student data extraction
  const studentData = (() => {
    try {
      const data = localStorage.getItem('studentData');
      return data ? JSON.parse(data) : { name: 'Anonymous' };
    } catch (error) {
      console.error('Error parsing student data:', error);
      return { name: 'Anonymous' };
    }
  })();

  // Safe badge level determination
  const badgeLevel = Object.keys(BADGE_CONFIG).find(
    level => scorePercentage >= BADGE_CONFIG[level].threshold
  ) || 'beginner';
  
  const badge = BADGE_CONFIG[badgeLevel];
  const BadgeIcon = badge.icon;

  useEffect(() => {
    if (studentData?.name && studentData.name !== 'Anonymous') {
      try {
        saveScore(studentData.name, score, totalQuestions, timeSpent, difficulty);
        updateLeaderboard();
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  }, [studentData.name, score, totalQuestions, timeSpent, difficulty]);

  const updateLeaderboard = () => {
    try {
      const data = getLeaderboard(difficulty, leaderboardPeriod);
      setLeaderboardData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      setLeaderboardData([]);
    }
  };

  const handlePeriodChange = (event, newPeriod) => {
    if (!newPeriod) return;
    setLeaderboardPeriod(newPeriod);
    try {
      const data = getLeaderboard(difficulty, newPeriod);
      setLeaderboardData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboardData([]);
    }
  };

  const formatTime = (seconds) => {
    try {
      const validSeconds = Math.max(0, parseInt(seconds) || 0);
      const minutes = Math.floor(validSeconds / 60);
      const remainingSeconds = validSeconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } catch (error) {
      return '0:00';
    }
  };

  const handleShare = async () => {
    const shareText = `I scored ${score} out of ${totalQuestions} (${scorePercentage.toFixed(1)}%) on the ${difficulty} cybersecurity quiz! 🏆 Badge: ${badge.title}`;
    
    try {
      if (navigator?.share) {
        await navigator.share({
          title: 'My CyberQuiz Results',
          text: shareText,
          url: window.location.href
        });
      } else {
        setShowShareDialog(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setShowShareDialog(true);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Results Summary */}
      <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Quiz Complete!
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            Score: {score} out of {totalQuestions} ({scorePercentage.toFixed(1)}%)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getFeedbackMessage(scorePercentage)}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <TrophyIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">
                {score} out of {totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">Correct Answers</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <TimerIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">{formatTime(timeSpent)}</Typography>
              <Typography variant="body2" color="text.secondary">Time Taken</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <StarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{difficulty}</Typography>
              <Typography variant="body2" color="text.secondary">Difficulty Level</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Badge Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Achievement Badge
          </Typography>
          <Box sx={{ display: 'inline-block', position: 'relative' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: badge.backgroundColor,
                border: `3px solid ${badge.color}`,
                boxShadow: 3,
                margin: '1rem'
              }}
            >
              <BadgeIcon sx={{ fontSize: 60, color: badge.color }} />
            </Avatar>
          </Box>
          <Typography variant="subtitle1" sx={{ color: badge.color, fontWeight: 'bold' }}>
            {badge.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Try Another Quiz
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            Share Results
          </Button>
        </Box>
      </Paper>

      {/* Leaderboard Section */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Leaderboard
        </Typography>
        <Tabs
          value={leaderboardPeriod}
          onChange={handlePeriodChange}
          sx={{ mb: 2 }}
        >
          <Tab label="Daily" value="daily" />
          <Tab label="Weekly" value="weekly" />
          <Tab label="All Time" value="allTime" />
        </Tabs>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Time</TableCell>
                <TableCell align="right">Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboardData.map((entry, index) => (
                <TableRow 
                  key={index}
                  sx={{
                    backgroundColor: entry.player === studentData.name ? 'action.selected' : 'inherit'
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{entry.player}</TableCell>
                  <TableCell align="right">
                    {entry.score} out of {entry.total}
                  </TableCell>
                  <TableCell align="right">{formatTime(entry.timeSpent)}</TableCell>
                  <TableCell align="right">{entry.points}</TableCell>
                </TableRow>
              ))}
              {leaderboardData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No entries yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)}>
        <DialogTitle>Share Your Results</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Copy this text to share your achievement:
          </Typography>
          <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            I scored {score} out of {totalQuestions} ({scorePercentage.toFixed(1)}%) on the {difficulty} cybersecurity quiz!
            🏆 Badge: {badge.title}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Results; 