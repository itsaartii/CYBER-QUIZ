import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Box,
} from '@mui/material';
import {
  Timer as TimerIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const QuizRulesDialog = ({ open, onClose, onStartQuiz }) => {
  const rules = [
    {
      icon: <TimerIcon color="primary" />,
      text: 'The quiz is timed. Complete all questions within the allocated time for bonus points.',
    },
    {
      icon: <SecurityIcon color="primary" />,
      text: 'Full-screen mode is required. Exiting full-screen will trigger a warning.',
    },
    {
      icon: <BlockIcon color="primary" />,
      text: 'Tab switching, right-clicking, and keyboard shortcuts are disabled during the quiz.',
    },
    {
      icon: <CheckIcon color="primary" />,
      text: 'Each question has one correct answer. Select carefully before submitting.',
    },
  ];

  const warnings = [
    'Three tab-switch attempts will automatically end the quiz',
    'Answers cannot be changed after submission',
    'The quiz cannot be paused once started',
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" gutterBottom>
          Quiz Rules & Guidelines
        </Typography>
      </DialogTitle>

      <DialogContent>
        <List>
          {rules.map((rule, index) => (
            <ListItem key={index}>
              <ListItemIcon>{rule.icon}</ListItemIcon>
              <ListItemText primary={rule.text} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <Alert 
            severity="warning"
            icon={<WarningIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Important Warnings:
            </Typography>
            <List dense>
              {warnings.map((warning, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={warning}
                    primaryTypographyProps={{
                      variant: 'body2',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Review Notes
        </Button>
        <Button
          onClick={onStartQuiz}
          variant="contained"
          color="primary"
          autoFocus
        >
          I Understand, Start Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizRulesDialog; 