import React, { useState, useEffect, useCallback, memo } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import questionsData from '../data/questions.json';

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

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login');
    }

    // Load questions from localStorage or use default questions from json
    const savedQuestions = localStorage.getItem('quizQuestions');
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      // Convert questions from the JSON structure to flat array with difficulty
      const flatQuestions = Object.entries(questionsData.questions).flatMap(([difficulty, questions]) =>
        questions.map(question => ({
          ...question,
          difficulty
        }))
      );
      setQuestions(flatQuestions);
      localStorage.setItem('quizQuestions', JSON.stringify(flatQuestions));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  const handleAddQuestion = useCallback(() => {
    try {
      // Validate required fields
      if (!newQuestion.question?.trim()) {
        throw new Error('Question text is required');
      }
      if (!newQuestion.options?.length || newQuestion.options.some(opt => !opt.trim())) {
        throw new Error('All options must be filled out');
      }
      if (!newQuestion.explanation?.trim()) {
        throw new Error('Explanation is required');
      }
      if (typeof newQuestion.correctAnswer !== 'number' || newQuestion.correctAnswer < 0 || newQuestion.correctAnswer >= newQuestion.options.length) {
        throw new Error('Valid correct answer is required');
      }
      if (!newQuestion.points || newQuestion.points < 0) {
        throw new Error('Valid points value is required');
      }

      // Validate scenario-specific fields
      if (newQuestion.scenario?.type === 'email' && (!newQuestion.scenario.from?.trim() || !newQuestion.scenario.subject?.trim())) {
        throw new Error('Email scenario requires From and Subject fields');
      }
      if (newQuestion.scenario?.type === 'image' && !newQuestion.scenario.imageUrl?.trim()) {
        throw new Error('Image URL is required for image scenario');
      }

      const questionData = {
        ...newQuestion,
        id: Date.now().toString(),
        difficulty: selectedDifficulty,
        timestamp: Date.now()
      };

      // Create updated questions array
      const updatedQuestions = [...questions, questionData];
      
      // Save to localStorage
      localStorage.setItem('quizQuestions', JSON.stringify(updatedQuestions));
      
      // Verify the save was successful
      const savedQuestions = localStorage.getItem('quizQuestions');
      const parsedSavedQuestions = JSON.parse(savedQuestions);
      
      if (!Array.isArray(parsedSavedQuestions)) {
        throw new Error('Failed to save question - invalid data structure');
      }
      
      const savedQuestion = parsedSavedQuestions.find(q => q.id === questionData.id);
      if (!savedQuestion) {
        throw new Error('Failed to save question - question not found in saved data');
      }
      
      // Update state only after successful verification
      setQuestions(updatedQuestions);
      setShowAddDialog(false);
      setNewQuestion(emptyQuestion);
      
      // Show success message
      alert('Question added successfully! The question has been verified in the database.');
    } catch (error) {
      console.error('Error saving question:', error);
      alert(`Error saving question: ${error.message}`);
    }
  }, [questions, newQuestion, selectedDifficulty, emptyQuestion]);

  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setShowEditDialog(true);
  };

  const handleEditSave = useCallback((updatedQuestion) => {
    try {
      const updatedQuestions = questions.map(q => 
        q.id === updatedQuestion.id ? { ...updatedQuestion, timestamp: Date.now() } : q
      );
      
      // Save to localStorage
      localStorage.setItem('quizQuestions', JSON.stringify(updatedQuestions));
      
      // Update state only after successful save
      setQuestions(updatedQuestions);
      setShowEditDialog(false);
      setEditingQuestion(null);
      
      // Show success message
      alert('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Error updating question. Please try again.');
    }
  }, [questions]);

  const handleDeleteQuestion = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const updatedQuestions = questions.filter(q => q.id !== id);
        
        // Save to localStorage
        localStorage.setItem('quizQuestions', JSON.stringify(updatedQuestions));
        
        // Update state only after successful save
        setQuestions(updatedQuestions);
        
        // Show success message
        alert('Question deleted successfully!');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question. Please try again.');
      }
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

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'var(--card-bg)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

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

      <Paper sx={{ p: 3, backgroundColor: 'var(--card-bg)' }}>
        <Typography variant="h6" gutterBottom>
          Questions ({selectedDifficulty})
        </Typography>
        <List>
          {questions
            .filter(q => q.difficulty === selectedDifficulty)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .map((question) => (
              <ListItem 
                key={question.id || question.question} 
                divider
                sx={{
                  backgroundColor: question.timestamp && Date.now() - question.timestamp < 5000 ? 
                    'rgba(25, 118, 210, 0.08)' : 'transparent',
                  transition: 'background-color 0.5s ease'
                }}
              >
                <ListItemText
                  primary={question.question}
                  secondary={
                    <>
                      <Typography component="span" display="block" color="textSecondary">
                        Scenario Type: {question.scenario?.type || 'N/A'}
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
                          {new Date(question.timestamp).toLocaleString()}
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
    </Box>
  );
};

export default AdminDashboard; 