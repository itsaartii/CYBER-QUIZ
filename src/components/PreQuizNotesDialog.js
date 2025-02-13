import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  LightbulbOutlined as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  MenuBook as TheoryIcon,
  Build as PracticalIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';
import QuizRulesDialog from './QuizRulesDialog';

const TypingEffect = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 30); // Adjust typing speed here
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <span>{displayedText}</span>;
};

const PreQuizNotesDialog = ({ open, notes, loading, onClose, onStartQuiz }) => {
  const [typedNotes, setTypedNotes] = useState([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [showTranslateHint, setShowTranslateHint] = useState(false);

  const supportedLanguages = {
    hi: 'Hindi',
    bn: 'Bengali',
    te: 'Telugu',
    ta: 'Tamil',
    mr: 'Marathi',
    gu: 'Gujarati',
    kn: 'Kannada',
    ml: 'Malayalam',
    pa: 'Punjabi',
    or: 'Odia',
    as: 'Assamese',
    bho: 'Bhojpuri',
    sd: 'Sindhi',
    ur: 'Urdu',
    sa: 'Sanskrit'
  };

  useEffect(() => {
    if (open && loading) {
      setTypedNotes([]);
      setCurrentNoteIndex(0);
      setIsTyping(true);
      setShowTranslateHint(false);
    }
  }, [open, loading]);

  const handleNoteComplete = () => {
    if (currentNoteIndex < notes.length - 1) {
      setCurrentNoteIndex(prev => prev + 1);
    } else {
      setIsTyping(false);
      setShowTranslateHint(true);
    }
  };

  const handleShowRules = () => {
    setShowRules(true);
  };

  const handleCloseRules = () => {
    setShowRules(false);
  };

  const handleStartQuizAfterRules = () => {
    setShowRules(false);
    onStartQuiz();
  };

  const handleTranslateClick = () => {
    const translateElement = document.getElementById('google_translate_element');
    if (translateElement) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Add a visual highlight effect
      translateElement.style.transition = 'all 0.3s ease';
      translateElement.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.3)';
      setTimeout(() => {
        translateElement.style.boxShadow = '';
      }, 1000);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Typography variant="h5" component="div" gutterBottom>
                Quick Study Notes
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {isTyping ? "Generating personalized notes based on quiz content..." : "Review these key points with theory and practical applications"}
              </Typography>
            </div>
            {!isTyping && (
              <Tooltip title="Translate to Regional Languages">
                <IconButton
                  onClick={handleTranslateClick}
                  color="primary"
                >
                  <TranslateIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          {showTranslateHint && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Study in your preferred language! Click the translate icon or use the language selector at the top right to choose from:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {Object.entries(supportedLanguages).map(([code, name]) => (
                  <Chip
                    key={code}
                    label={name}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Alert>
          )}
          
          <List>
            {notes.map((note, index) => (
              <React.Fragment key={index}>
                <Accordion
                  defaultExpanded={true}
                  sx={{
                    mb: 1,
                    '&:before': {
                      display: 'none',
                    },
                    opacity: index > currentNoteIndex ? 0.3 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiAccordionSummary-expandIconWrapper': {
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LightbulbIcon sx={{ color: 'primary.contrastText' }} />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 'medium' }}>
                      {index <= currentNoteIndex ? (
                        <TypingEffect 
                          text={note.point} 
                          onComplete={index === currentNoteIndex ? handleNoteComplete : undefined}
                        />
                      ) : '...'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <Paper elevation={0} sx={{ p: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TheoryIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" color="primary" fontWeight="medium">
                            Theory
                          </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ pl: 4 }}>
                          {index <= currentNoteIndex ? (
                            <TypingEffect text={note.theory} />
                          ) : '...'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PracticalIcon color="secondary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" color="secondary" fontWeight="medium">
                            Practical Application
                          </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ pl: 4 }}>
                          {index <= currentNoteIndex ? (
                            <TypingEffect text={note.practical} />
                          ) : '...'}
                        </Typography>
                      </Box>
                    </Paper>
                  </AccordionDetails>
                </Accordion>
                {index < notes.length - 1 && (
                  <Divider variant="middle" sx={{ my: 1 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {!isTyping && (
            <>
              <Button onClick={onClose} color="inherit">
                Review Later
              </Button>
              <Button
                onClick={handleShowRules}
                variant="contained"
                color="primary"
                autoFocus
              >
                Start Quiz
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <QuizRulesDialog
        open={showRules}
        onClose={handleCloseRules}
        onStartQuiz={handleStartQuizAfterRules}
      />
    </>
  );
};

export default PreQuizNotesDialog; 