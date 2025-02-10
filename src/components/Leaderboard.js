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
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        width: '100%', 
        maxWidth: 'md', 
        mx: 'auto',
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        color: 'var(--text-color)'
      }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Leaderboard
        </Typography>
        <Chip
          label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          color={getDifficultyColor()}
          sx={{ 
            fontSize: '1rem',
            fontWeight: 500
          }}
        />
      </Box>

      <ToggleButtonGroup
        value={timeFrame}
        exclusive
        onChange={handleTimeFrameChange}
        aria-label="time frame"
        sx={{ 
          mb: 3, 
          width: '100%',
          '& .MuiToggleButton-root': {
            flex: 1,
            py: 1
          }
        }}
      >
        <ToggleButton value="daily" aria-label="daily">
          Daily
        </ToggleButton>
        <ToggleButton value="weekly" aria-label="weekly">
          Weekly
        </ToggleButton>
        <ToggleButton value="allTime" aria-label="all time">
          All Time
        </ToggleButton>
      </ToggleButtonGroup>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Score</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Time</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data[timeFrame].map((entry, index) => (
              <TableRow
                key={index}
                sx={{
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'var(--secondary-bg)'
                  }
                }}
              >
                <TableCell sx={{ 
                  fontWeight: index < 3 ? 700 : 400,
                  fontSize: index < 3 ? '1.1rem' : 'inherit'
                }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: index < 3 ? 600 : 400 
                }}>
                  {entry.player}
                </TableCell>
                <TableCell align="right">{entry.score}/{entry.total}</TableCell>
                <TableCell align="right">{formatTime(entry.timeSpent)}</TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: index < 3 ? 600 : 400 
                }}>
                  {entry.points}
                </TableCell>
              </TableRow>
            ))}
            {data[timeFrame].length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={5} 
                  align="center"
                  sx={{
                    py: 4,
                    color: 'var(--text-secondary)',
                    fontSize: '1.1rem'
                  }}
                >
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