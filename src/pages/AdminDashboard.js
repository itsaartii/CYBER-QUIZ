import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Snackbar,
  Alert,
  FormHelperText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import questionsData from '../data/questions.json';
import { generateMCQuestion, getAvailableModels } from '../utils/aiUtils';

const QuestionDialog = memo(({ open, onClose, onSave, isEditing, initialQuestion }) => {
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);

  useEffect(() => {
    setCurrentQuestion(initialQuestion);
  }, [initialQuestion]);

  const handleQuestionChange = useCallback((field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleScenarioChange = useCallback((field, value) => {
    setCurrentQuestion(prev => {
      let updatedScenario;

      if (field === 'type') {
        updatedScenario = {
          type: value,
          content: prev.scenario?.content || '',
          redFlags: prev.scenario?.redFlags || [],
          ...(value === 'email' && {
            from: '',
            subject: ''
          }),
          ...(value === 'image' && {
            imageUrl: ''
          })
        };
      } else {
        updatedScenario = {
          ...prev.scenario,
          [field]: value
        };
      }

      return {
        ...prev,
        scenario: updatedScenario
      };
    });
  }, []);

  const handleOptionChange = useCallback((index, value) => {
    setCurrentQuestion(prev => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = value;
      return {
        ...prev,
        options: updatedOptions
      };
    });
  }, []);

  const handleRedFlagsChange = useCallback((value) => {
    const redFlags = value.split(',').map(flag => flag.trim()).filter(flag => flag);
    setCurrentQuestion(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        redFlags
      }
    }));
  }, []);

  const handleSave = useCallback(() => {
    // Validate required fields
    if (!currentQuestion.question.trim()) {
      alert('Question text is required');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert('All options must be filled out');
      return;
    }

    if (currentQuestion.scenario?.type === 'email' && 
        (!currentQuestion.scenario.from.trim() || !currentQuestion.scenario.subject.trim())) {
      alert('Email scenario requires From and Subject fields');
      return;
    }

    if (currentQuestion.scenario?.type === 'image' && !currentQuestion.scenario.imageUrl.trim()) {
      alert('Image URL is required for image scenario');
      return;
    }

    if (!currentQuestion.explanation.trim()) {
      alert('Explanation is required');
      return;
    }

    // All validations passed, save the question
    onSave(currentQuestion);
  }, [currentQuestion, onSave]);

  if (!currentQuestion) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionProps={{
        unmountOnExit: true,
        mountOnEnter: true
      }}
    >
      <DialogTitle>{isEditing ? 'Edit Question' : 'Add New Question'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Question"
          multiline
          rows={3}
          value={currentQuestion.question}
          onChange={(e) => handleQuestionChange('question', e.target.value)}
          margin="normal"
        />

        <Accordion sx={{ mt: 2, mb: 2 }}>
          <AccordionSummary>
            <Typography>Scenario Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth margin="normal">
              <InputLabel>Scenario Type</InputLabel>
              <Select
                value={currentQuestion.scenario?.type || 'email'}
                onChange={(e) => handleScenarioChange('type', e.target.value)}
                label="Scenario Type"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="network_setup">Network Setup</MenuItem>
                <MenuItem value="password_analysis">Password Analysis</MenuItem>
                <MenuItem value="web_request">Web Request</MenuItem>
                <MenuItem value="popup">Popup</MenuItem>
                <MenuItem value="image">Image</MenuItem>
              </Select>
            </FormControl>

            {currentQuestion.scenario?.type === 'email' && (
              <>
                <TextField
                  fullWidth
                  label="From"
                  value={currentQuestion.scenario?.from || ''}
                  onChange={(e) => handleScenarioChange('from', e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Subject"
                  value={currentQuestion.scenario?.subject || ''}
                  onChange={(e) => handleScenarioChange('subject', e.target.value)}
                  margin="normal"
                />
              </>
            )}

            {currentQuestion.scenario?.type === 'image' && (
              <TextField
                fullWidth
                label="Image URL"
                value={currentQuestion.scenario?.imageUrl || ''}
                onChange={(e) => handleScenarioChange('imageUrl', e.target.value)}
                helperText="Enter the URL of the image to display"
                margin="normal"
              />
            )}

            {currentQuestion.scenario?.type !== 'none' && (
              <>
                <TextField
                  fullWidth
                  label="Content"
                  multiline
                  rows={3}
                  value={currentQuestion.scenario?.content || ''}
                  onChange={(e) => handleScenarioChange('content', e.target.value)}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Red Flags (comma-separated)"
                  value={currentQuestion.scenario?.redFlags?.join(', ') || ''}
                  onChange={(e) => handleRedFlagsChange(e.target.value)}
                  helperText="Enter red flags separated by commas"
                  margin="normal"
                />
              </>
            )}
          </AccordionDetails>
        </Accordion>

        {currentQuestion.options.map((option, index) => (
          <TextField
            key={index}
            fullWidth
            label={`Option ${index + 1}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            margin="normal"
          />
        ))}

        <FormControl fullWidth margin="normal">
          <InputLabel>Correct Answer</InputLabel>
          <Select
            value={currentQuestion.correctAnswer}
            onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
            label="Correct Answer"
          >
            {currentQuestion.options.map((_, index) => (
              <MenuItem key={index} value={index}>
                Option {index + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Explanation"
          multiline
          rows={3}
          value={currentQuestion.explanation}
          onChange={(e) => handleQuestionChange('explanation', e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Points"
          type="number"
          value={currentQuestion.points}
          onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 10)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {isEditing ? 'Save Changes' : 'Add Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

const AIGenerateDialog = memo(({ open, onClose, onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const question = await generateMCQuestion(topic);
      onGenerate(question);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Generate Question with AI</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., phishing emails, password security, network security"
          margin="normal"
          disabled={loading}
        />
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleGenerate} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
});

const AIQuestionReviewDialog = memo(({ open, onClose, question, onApprove }) => {
  const [editedQuestion, setEditedQuestion] = useState(null);

  useEffect(() => {
    if (question) {
      setEditedQuestion(question);
    }
  }, [question]);

  // Don't render anything if dialog is not open
  if (!open) return null;

  // Show loading state if question is not yet available
  if (!editedQuestion) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Review AI Generated Question</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Review AI Generated Question</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Please review and edit if necessary before adding to the question bank
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Question"
          multiline
          rows={3}
          value={editedQuestion.question || ''}
          onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
          margin="normal"
        />

        <Accordion sx={{ mt: 2, mb: 2 }}>
          <AccordionSummary>
            <Typography>Scenario Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth margin="normal">
              <InputLabel>Scenario Type</InputLabel>
              <Select
                value={editedQuestion.scenario?.type || 'message'}
                onChange={(e) => setEditedQuestion({
                  ...editedQuestion,
                  scenario: { 
                    ...(editedQuestion.scenario || {}), 
                    type: e.target.value 
                  }
                })}
                label="Scenario Type"
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="network_setup">Network Setup</MenuItem>
                <MenuItem value="password_analysis">Password Analysis</MenuItem>
                <MenuItem value="web_request">Web Request</MenuItem>
                <MenuItem value="popup">Popup</MenuItem>
                <MenuItem value="message">Message</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Scenario Content"
              multiline
              rows={3}
              value={editedQuestion.scenario?.content || ''}
              onChange={(e) => setEditedQuestion({
                ...editedQuestion,
                scenario: { 
                  ...(editedQuestion.scenario || {}), 
                  content: e.target.value 
                }
              })}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Red Flags (comma-separated)"
              value={editedQuestion.scenario?.redFlags?.join(', ') || ''}
              onChange={(e) => {
                const redFlags = e.target.value.split(',').map(flag => flag.trim()).filter(Boolean);
                setEditedQuestion({
                  ...editedQuestion,
                  scenario: { 
                    ...(editedQuestion.scenario || {}), 
                    redFlags 
                  }
                });
              }}
              margin="normal"
            />
          </AccordionDetails>
        </Accordion>

        {(editedQuestion.options || []).map((option, index) => (
          <TextField
            key={index}
            fullWidth
            label={`Option ${index + 1}${index === editedQuestion.correctAnswer ? ' (Correct Answer)' : ''}`}
            value={option || ''}
            onChange={(e) => {
              const newOptions = [...(editedQuestion.options || ['', '', '', ''])];
              newOptions[index] = e.target.value;
              setEditedQuestion({ ...editedQuestion, options: newOptions });
            }}
            margin="normal"
            sx={index === editedQuestion.correctAnswer ? {
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'success.main',
                },
              },
            } : {}}
          />
        ))}

        <FormControl fullWidth margin="normal">
          <InputLabel>Correct Answer</InputLabel>
          <Select
            value={editedQuestion.correctAnswer || 0}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
            label="Correct Answer"
          >
            {(editedQuestion.options || []).map((_, index) => (
              <MenuItem key={index} value={index}>
                Option {index + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Explanation"
          multiline
          rows={3}
          value={editedQuestion.explanation || ''}
          onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={editedQuestion.difficulty || 'beginner'}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, difficulty: e.target.value })}
            label="Difficulty"
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={() => onApprove(editedQuestion)} 
          variant="contained" 
          color="primary"
        >
          Approve & Add Question
        </Button>
      </DialogActions>
    </Dialog>
  );
});

// Fix the memoized question count function
const getQuestionCountByDifficulty = (questions, difficulty) => {
  return questions.filter(q => q.difficulty === difficulty).length;
};

const MemoizedQuestionCount = memo(({ questions, difficulty }) => {
  const count = getQuestionCountByDifficulty(questions, difficulty);
  return (
    <Typography variant="h4">
      {count}
    </Typography>
  );
});

// Utility function for data validation
const validateQuestion = (question) => {
  const errors = [];
  
  if (!question.question?.trim()) {
    errors.push('Question text is required');
  }
  if (!Array.isArray(question.options) || question.options.length !== 4 || question.options.some(opt => !opt?.trim())) {
    errors.push('All four options must be filled out');
  }
  if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer > 3) {
    errors.push('Valid correct answer is required');
  }
  if (!question.explanation?.trim()) {
    errors.push('Explanation is required');
  }
  if (!question.points || question.points < 0) {
    errors.push('Valid points value is required');
  }

  // Scenario-specific validation
  if (question.type === 'scenario') {
    if (question.scenario?.type === 'email' && (!question.scenario.from?.trim() || !question.scenario.subject?.trim())) {
      errors.push('Email scenario requires From and Subject fields');
    }
    if (question.scenario?.type === 'image' && !question.scenario.imageUrl?.trim()) {
      errors.push('Image URL is required for image scenario');
    }
  }

  return errors;
};

// Utility function for saving questions to localStorage
const saveQuestionsToStorage = (questions) => {
  try {
    localStorage.setItem('quizQuestions', JSON.stringify(questions));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Utility function for loading questions from localStorage
const loadQuestionsFromStorage = () => {
  try {
    const savedQuestions = localStorage.getItem('quizQuestions');
    return savedQuestions ? JSON.parse(savedQuestions) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const emptyQuestion = {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    type: 'scenario',
    points: 10,
    scenario: {
      type: 'email',
      from: '',
      subject: '',
      content: '',
      redFlags: []
    }
  };
  const [newQuestion, setNewQuestion] = useState(emptyQuestion);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [aiGeneratedQuestion, setAiGeneratedQuestion] = useState(null);
  const [showAiReviewDialog, setShowAiReviewDialog] = useState(false);

  // Optimized useEffect for loading questions
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    const loadQuestions = () => {
      const savedQuestions = loadQuestionsFromStorage();
      if (savedQuestions) {
        setQuestions(savedQuestions);
      } else {
        const flatQuestions = Object.entries(questionsData.questions)
          .flatMap(([difficulty, questions]) =>
            questions.map(question => ({
              ...question,
              difficulty,
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now()
            }))
          );
        setQuestions(flatQuestions);
        saveQuestionsToStorage(flatQuestions);
      }
    };

    loadQuestions();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  // Optimized handleAddQuestion with proper validation
  const handleAddQuestion = useCallback(() => {
    try {
      const validationErrors = validateQuestion(newQuestion);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      const questionData = {
        ...newQuestion,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        difficulty: selectedDifficulty,
        timestamp: Date.now()
      };

      const updatedQuestions = [...questions, questionData];
      
      if (!saveQuestionsToStorage(updatedQuestions)) {
        throw new Error('Failed to save question to storage');
      }

      setQuestions(updatedQuestions);
      setShowAddDialog(false);
      setNewQuestion(emptyQuestion);
      
      setNotification({
        open: true,
        message: 'Question added successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving question:', error);
      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  }, [questions, newQuestion, selectedDifficulty, emptyQuestion]);

  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setShowEditDialog(true);
  };

  // Optimized handleEditSave with validation
  const handleEditSave = useCallback((updatedQuestion) => {
    try {
      const validationErrors = validateQuestion(updatedQuestion);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      const updatedQuestions = questions.map(q => 
        q.id === updatedQuestion.id ? { ...updatedQuestion, timestamp: Date.now() } : q
      );
      
      if (!saveQuestionsToStorage(updatedQuestions)) {
        throw new Error('Failed to save updated question');
      }

      setQuestions(updatedQuestions);
      setShowEditDialog(false);
      setEditingQuestion(null);
      
      setNotification({
        open: true,
        message: 'Question updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating question:', error);
      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  }, [questions]);

  // Optimized handleDeleteQuestion with proper error handling
  const handleDeleteQuestion = useCallback((id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const updatedQuestions = questions.filter(q => q.id !== id);
      
      if (!saveQuestionsToStorage(updatedQuestions)) {
        throw new Error('Failed to save after deletion');
      }

      setQuestions(updatedQuestions);
      
      setNotification({
        open: true,
        message: 'Question deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  }, [questions]);

  const handleOptionChange = (index, value, isEditing = false) => {
    const updatedOptions = isEditing 
      ? [...editingQuestion.options]
      : [...newQuestion.options];
    updatedOptions[index] = value;
    
    if (isEditing) {
      setEditingQuestion({ ...editingQuestion, options: updatedOptions });
    } else {
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    }
  };

  const handleScenarioChange = (field, value, isEditing = false) => {
    const currentQuestion = isEditing ? editingQuestion : newQuestion;
    let updatedScenario;

    if (field === 'type') {
      // When changing scenario type, maintain the basic structure
      updatedScenario = {
        type: value,
        content: '',
        redFlags: [],
        // Add specific fields based on type
        ...(value === 'email' && {
          from: '',
          subject: ''
        }),
        ...(value === 'image' && {
          imageUrl: ''
        })
      };
    } else {
      // For other field changes, maintain existing data
      updatedScenario = {
        ...currentQuestion.scenario,
        [field]: value
      };
    }
    
    if (isEditing) {
      setEditingQuestion({
        ...editingQuestion,
        scenario: updatedScenario
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        scenario: updatedScenario
      });
    }
  };

  const handleRedFlagsChange = (value, isEditing = false) => {
    const redFlags = value.split(',').map(flag => flag.trim()).filter(flag => flag);
    const currentQuestion = isEditing ? editingQuestion : newQuestion;
    
    if (isEditing) {
      setEditingQuestion({
        ...editingQuestion,
        scenario: {
          ...editingQuestion.scenario,
          redFlags
        }
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        scenario: {
          ...newQuestion.scenario,
          redFlags
        }
      });
    }
  };

  // Update verifyDataIntegrity function
  const verifyDataIntegrity = useCallback(() => {
    try {
      const savedQuestions = localStorage.getItem('quizQuestions');
      if (savedQuestions) {
        const parsedQuestions = JSON.parse(savedQuestions);
        if (!Array.isArray(parsedQuestions)) {
          throw new Error('Invalid data structure');
        }
        
        // Validate each question's structure
        parsedQuestions.forEach((question, index) => {
          if (!question.id) {
            throw new Error(`Question at index ${index} is missing an ID`);
          }
          if (!question.question?.trim()) {
            throw new Error(`Question at index ${index} is missing question text`);
          }
          if (!Array.isArray(question.options) || question.options.length !== 4) {
            throw new Error(`Question at index ${index} has invalid options`);
          }
          if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
            throw new Error(`Question at index ${index} has invalid correct answer`);
          }
        });

        // Verify if state matches localStorage
        if (JSON.stringify(questions) !== savedQuestions) {
          console.warn('Data inconsistency detected, reloading from localStorage');
          setQuestions(parsedQuestions);
        }
      }
    } catch (error) {
      console.error('Data integrity check failed:', error);
      alert(`Data integrity check failed: ${error.message}. Please refresh the page.`);
    }
  }, [questions]);

  // Add data integrity check on mount and after operations
  useEffect(() => {
    verifyDataIntegrity();
  }, [verifyDataIntegrity]);

  const handleAIGenerate = (question) => {
    setAiGeneratedQuestion(question);
    setShowAiReviewDialog(true);
    setAiDialogOpen(false);
  };

  // Optimized handleApproveAiQuestion with validation
  const handleApproveAiQuestion = useCallback((approvedQuestion) => {
    try {
      const validationErrors = validateQuestion(approvedQuestion);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      const questionData = {
        ...approvedQuestion,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };

      const updatedQuestions = [...questions, questionData];
      
      if (!saveQuestionsToStorage(updatedQuestions)) {
        throw new Error('Failed to save AI-generated question');
      }

      setQuestions(updatedQuestions);
      setShowAiReviewDialog(false);
      setAiGeneratedQuestion(null);
      
      setNotification({
        open: true,
        message: 'AI-generated question added successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving AI-generated question:', error);
      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  }, [questions]);

  // Memoized filtered questions
  const filteredQuestions = useMemo(() => 
    questions
      .filter(q => q.difficulty === selectedDifficulty)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
    [questions, selectedDifficulty]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">LNCT Dashboard</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAiDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Generate with AI
          </Button>
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'var(--card-bg)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setShowAddDialog(true)}
            >
              Add New Question
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3, p: 2, backgroundColor: 'var(--card-bg)', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Question Count Summary
        </Typography>
        <Grid container spacing={2}>
          {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
            <Grid item xs={12} sm={4} key={difficulty}>
              <Paper 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  backgroundColor: difficulty === selectedDifficulty ? 'primary.main' : 'background.paper',
                  color: difficulty === selectedDifficulty ? 'primary.contrastText' : 'text.primary'
                }}
              >
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                  {difficulty}
                </Typography>
                <MemoizedQuestionCount questions={questions} difficulty={difficulty} />
                <Typography variant="body2" color={difficulty === selectedDifficulty ? 'inherit' : 'text.secondary'}>
                  questions
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Paper sx={{ p: 3, backgroundColor: 'var(--card-bg)' }}>
        <Typography variant="h6" gutterBottom>
          Questions ({selectedDifficulty}) - {filteredQuestions.length} questions
        </Typography>
        <List>
          {filteredQuestions.map((question, index, array) => (
            <ListItem 
              key={question.id || question.question} 
              divider
              sx={{
                backgroundColor: question.timestamp && Date.now() - question.timestamp < 5000 ? 
                  'rgba(25, 118, 210, 0.08)' : 'transparent',
                transition: 'background-color 0.5s ease'
              }}
            >
              <Box sx={{ mr: 2, minWidth: '30px', color: 'text.secondary' }}>
                #{array.length - index}
              </Box>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">{question.question}</Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" display="block" color="textSecondary">
                      Type: {question.type === 'scenario' ? `Scenario (${question.scenario?.type || 'N/A'})` : 'Regular MCQ'}
                    </Typography>
                    <Typography component="span" display="block" color="textSecondary">
                      Correct Answer: Option {question.correctAnswer + 1}
                    </Typography>
                    <Typography component="span" display="block" color="textSecondary">
                      Points: {question.points}
                    </Typography>
                    {question.timestamp && (
                      <Typography 
                        component="span" 
                        display="block" 
                        color="textSecondary" 
                        sx={{ fontSize: '0.8rem', mt: 0.5 }}
                      >
                        Added: {new Date(question.timestamp).toLocaleString()}
                      </Typography>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  color="primary"
                  sx={{ mr: 1 }}
                  onClick={() => handleEditClick(question)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteQuestion(question.id || question.question)}
                >
                  Delete
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {filteredQuestions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary">
              No questions added for {selectedDifficulty} level yet.
            </Typography>
          </Box>
        )}
      </Paper>

      <QuestionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleAddQuestion}
        isEditing={false}
        initialQuestion={newQuestion}
      />

      <QuestionDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingQuestion(null);
        }}
        onSave={handleEditSave}
        isEditing={true}
        initialQuestion={editingQuestion}
      />

      <AIGenerateDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        onGenerate={handleAIGenerate}
      />

      <AIQuestionReviewDialog
        open={showAiReviewDialog}
        onClose={() => {
          setShowAiReviewDialog(false);
          setAiGeneratedQuestion(null);
        }}
        question={aiGeneratedQuestion}
        onApprove={handleApproveAiQuestion}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard; 