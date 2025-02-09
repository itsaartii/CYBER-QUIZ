import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from '@mui/material';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function Leaderboard({ data, difficulty }) {
  const [timeFrame, setTimeFrame] = useState('daily');

  const handleTimeFrameChange = (event, newTimeFrame) => {
    if (newTimeFrame !== null) {
      setTimeFrame(newTimeFrame);
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 'md', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Leaderboard
        </Typography>
        <Chip
          label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          color={getDifficultyColor()}
          sx={{ fontSize: '1rem' }}
        />
      </Box>

      <ToggleButtonGroup
        value={timeFrame}
        exclusive
        onChange={handleTimeFrameChange}
        aria-label="time frame"
        sx={{ mb: 3, width: '100%' }}
      >
        <ToggleButton value="daily" aria-label="daily" sx={{ flex: 1 }}>
          Daily
        </ToggleButton>
        <ToggleButton value="weekly" aria-label="weekly" sx={{ flex: 1 }}>
          Weekly
        </ToggleButton>
        <ToggleButton value="allTime" aria-label="all time" sx={{ flex: 1 }}>
          All Time
        </ToggleButton>
      </ToggleButtonGroup>

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
            {data[timeFrame].map((entry, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor: index < 3 ? 'action.hover' : 'inherit',
                  '& td:first-of-type': {
                    fontWeight: index < 3 ? 'bold' : 'normal',
                  },
                }}
              >
                <TableCell>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </TableCell>
                <TableCell>{entry.player}</TableCell>
                <TableCell align="right">{entry.score}/{entry.total}</TableCell>
                <TableCell align="right">{formatTime(entry.timeSpent)}</TableCell>
                <TableCell align="right">{entry.points}</TableCell>
              </TableRow>
            ))}
            {data[timeFrame].length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No entries yet. Be the first to make the leaderboard!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default Leaderboard; 