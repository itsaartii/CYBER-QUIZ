import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback';
import PreventTabSwitch from '../components/PreventTabSwitch';
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import quizData from '../data/questions.json';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function calculateTimeBonus(timeSpent, difficulty) {
  const maxTime = {
    beginner: 300, // 5 minutes
    intermediate: 600, // 10 minutes
    advanced: 900, // 15 minutes
  };

  const maxTimeBonus = {
    beginner: 50,
    intermediate: 100,
    advanced: 150,
  };

  const timeLimit = maxTime[difficulty];
  const maxBonus = maxTimeBonus[difficulty];

  if (timeSpent > timeLimit) return 0;
  return Math.round((1 - timeSpent / timeLimit) * maxBonus);
}

function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const difficulty = location.state?.difficulty || 'beginner';
  const [isQuizActive, setIsQuizActive] = useState(true);
  
  // Function to randomly select 10 questions from the pool
  const getRandomQuestions = (allQuestions, count = 10) => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Get all questions for the difficulty level and randomly select 10
  const allQuestionsForDifficulty = quizData.questions[difficulty];
  const [questions] = useState(() => getRandomQuestions(allQuestionsForDifficulty));
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizStartTime] = useState(Date.now());
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isQuizComplete) {
        setTimeSpent(Math.floor((Date.now() - quizStartTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuizComplete, quizStartTime]);

  const handleAnswerSelect = (event) => {
    setSelectedAnswer(parseInt(event.target.value));
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setIsAnswered(true);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
      setEarnedPoints(earnedPoints + questions[currentQuestion].points);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsAnswered(false);
    } else {
      // Quiz completed
      setIsQuizComplete(true);
      const timeBonus = calculateTimeBonus(timeSpent, difficulty);
      const finalPoints = earnedPoints + timeBonus;

      navigate('/results', {
        state: {
          score,
          total: questions.length,
          difficulty,
          points: finalPoints,
          maxPoints: questions.reduce((sum, q) => sum + q.points, 0),
          timeSpent,
          timeBonus,
        }
      });
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
    <PreventTabSwitch isQuizActive={isQuizActive}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 'md',
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          pb: { xs: '80px', sm: '100px' },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Chip
            label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            color={getDifficultyColor()}
            sx={{ fontSize: '1rem', py: 0.5 }}
          />
          <Typography variant="h6" color="text.secondary">
            Points: {earnedPoints}
          </Typography>
          <Chip
            label={`Time: ${formatTime(timeSpent)}`}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '1rem', py: 0.5 }}
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 10, borderRadius: 5 }}
        />
        
        <Typography variant="h6" align="center" color="text.secondary">
          Question {currentQuestion + 1} of {questions.length}
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            {questions[currentQuestion].question}
          </Typography>

          {questions[currentQuestion].scenario?.type === 'email' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: 'background.default',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>From:</strong> {questions[currentQuestion].scenario.from}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Subject:</strong> {questions[currentQuestion].scenario.subject}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line',
                  mt: 1
                }}
              >
                {questions[currentQuestion].scenario.content}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'popup' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#fff4e5',
                border: '2px solid #ed6c02'
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
                {questions[currentQuestion].scenario.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line'
                }}
              >
                {questions[currentQuestion].scenario.content}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'code_review' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre',
                  color: '#d4d4d4',
                  overflowX: 'auto'
                }}
              >
                {questions[currentQuestion].scenario.code}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'log_analysis' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line',
                  color: '#d4d4d4'
                }}
              >
                {questions[currentQuestion].scenario.entries?.join('\n') || questions[currentQuestion].scenario.log_entries?.join('\n')}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'network_traffic' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Pattern:</strong> {questions[currentQuestion].scenario.pattern}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Frequency:</strong> {questions[currentQuestion].scenario.frequency}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Target:</strong> {questions[currentQuestion].scenario.target}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'message' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f8f9fa'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>{questions[currentQuestion].scenario.sender}</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line'
                }}
              >
                {questions[currentQuestion].scenario.content}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'sms' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#e3f2fd',
                maxWidth: '300px'
              }}
            >
              <Typography variant="body2" gutterBottom color="primary">
                <strong>{questions[currentQuestion].scenario.sender}</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line'
                }}
              >
                {questions[currentQuestion].scenario.content}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'password_analysis' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              {questions[currentQuestion].scenario.passwords.map((password, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Password {index + 1}:</strong> {password.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Strength: {password.strength} | Issues: {password.issues.join(', ')}
                  </Typography>
                  {index < questions[currentQuestion].scenario.passwords.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'network_setup' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              {questions[currentQuestion].scenario.networks.map((network, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Network {index + 1}:</strong> {network.name}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Security: {network.security}
                  </Typography>
                  <Typography variant="caption" display="block">
                    VPN: {network.vpn ? '✅' : '❌'} | HTTPS: {network.https ? '✅' : '❌'}
                  </Typography>
                  {index < questions[currentQuestion].scenario.networks.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'system_prompt' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#fff',
                border: '1px solid #ccc'
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {questions[currentQuestion].scenario.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line'
                }}
              >
                {questions[currentQuestion].scenario.content}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'physical_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#ffebee'
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                <strong>Item:</strong> {questions[currentQuestion].scenario.item}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Context:</strong> {questions[currentQuestion].scenario.context}
              </Typography>
              <Typography variant="body2">
                <strong>Risks:</strong> {questions[currentQuestion].scenario.risks.join(', ')}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'webpage' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#fff'
              }}
            >
              <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary' }}>
                {questions[currentQuestion].scenario.url}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {questions[currentQuestion].scenario.elements.map((element, index) => (
                  <Button
                    key={index}
                    variant={element.type === 'legitimate' ? 'contained' : 'outlined'}
                    color={element.type === 'legitimate' ? 'primary' : 'inherit'}
                    sx={{ m: 1 }}
                    disabled={isAnswered}
                  >
                    {element.text}
                  </Button>
                ))}
              </Box>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'exploit_analysis' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Payload:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  color: '#d4d4d4',
                  overflowX: 'auto',
                  mt: 1
                }}
              >
                {questions[currentQuestion].scenario.payload}
              </Typography>
              <Divider sx={{ my: 1, borderColor: '#666' }} />
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Target:</strong> {questions[currentQuestion].scenario.target}
              </Typography>
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Protection:</strong> {questions[currentQuestion].scenario.protection}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'network_analysis' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Traffic Pattern:</strong> {questions[currentQuestion].scenario.traffic_pattern}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Timestamp:</strong> {questions[currentQuestion].scenario.timestamp}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Volume:</strong> {questions[currentQuestion].scenario.volume}
              </Typography>
              <Typography variant="body2">
                <strong>Characteristics:</strong> {questions[currentQuestion].scenario.characteristics.join(', ')}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'config_review' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Service:</strong> {questions[currentQuestion].scenario.service}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre',
                  color: '#d4d4d4',
                  mt: 1
                }}
              >
                {JSON.stringify(questions[currentQuestion].scenario.config, null, 2)}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'header_analysis' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre',
                  color: '#d4d4d4'
                }}
              >
                {Object.entries(questions[currentQuestion].scenario.headers)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n')}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'email_header' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace'
              }}
            >
              {Object.entries(questions[currentQuestion].scenario.headers).map(([key, value]) => (
                <Typography key={key} variant="body2" gutterBottom>
                  <strong>{key}:</strong> {value}
                </Typography>
              ))}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'process_list' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#d4d4d4' }}>Name</TableCell>
                    <TableCell sx={{ color: '#d4d4d4' }}>Path</TableCell>
                    <TableCell sx={{ color: '#d4d4d4' }}>CPU</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions[currentQuestion].scenario.processes.map((process, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#d4d4d4' }}>{process.name}</TableCell>
                      <TableCell sx={{ color: '#d4d4d4' }}>{process.path}</TableCell>
                      <TableCell sx={{ color: '#d4d4d4' }}>{process.cpu}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'packet_capture' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Protocol:</strong> {questions[currentQuestion].scenario.protocol}
              </Typography>
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Pattern:</strong> {questions[currentQuestion].scenario.pattern}
              </Typography>
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Destination:</strong> {questions[currentQuestion].scenario.destination}
              </Typography>
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Volume:</strong> {questions[currentQuestion].scenario.volume}
              </Typography>
              {questions[currentQuestion].scenario.payload && (
                <Typography variant="body2" sx={{ color: '#d4d4d4', mt: 1 }}>
                  <strong>Payload:</strong> {questions[currentQuestion].scenario.payload}
                </Typography>
              )}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'ssl_cert' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Domain:</strong> {questions[currentQuestion].scenario.domain}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Issuer:</strong> {questions[currentQuestion].scenario.issuer}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Subject:</strong> {questions[currentQuestion].scenario.subject}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Validity:</strong> {questions[currentQuestion].scenario.validity}
              </Typography>
              <Typography variant="body2">
                <strong>SAN:</strong> {questions[currentQuestion].scenario.san.join(', ')}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'url_analysis' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>URL:</strong> {questions[currentQuestion].scenario.url}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Method:</strong> {questions[currentQuestion].scenario.method}
              </Typography>
              <Typography variant="body2">
                <strong>Parameters:</strong> {questions[currentQuestion].scenario.params.join(', ')}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'cookie_analysis' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre',
                  color: '#d4d4d4'
                }}
              >
                {JSON.stringify(questions[currentQuestion].scenario.cookie, null, 2)}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'api_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre',
                  color: '#d4d4d4'
                }}
              >
                {`${questions[currentQuestion].scenario.request.method} ${questions[currentQuestion].scenario.request.endpoint}
Headers:
${JSON.stringify(questions[currentQuestion].scenario.request.headers, null, 2)}`}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'oauth_flow' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Redirect URI:</strong> {questions[currentQuestion].scenario.redirect_uri}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Response Type:</strong> {questions[currentQuestion].scenario.response_type}
              </Typography>
              <Typography variant="body2">
                <strong>State:</strong> {questions[currentQuestion].scenario.state === null ? 'null' : questions[currentQuestion].scenario.state}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'websocket_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>URL:</strong> {questions[currentQuestion].scenario.url}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Headers:</strong> {Object.keys(questions[currentQuestion].scenario.headers).length === 0 ? 'None' : JSON.stringify(questions[currentQuestion].scenario.headers)}
              </Typography>
              <Typography variant="body2">
                <strong>Origin:</strong> {questions[currentQuestion].scenario.origin === null ? 'null' : questions[currentQuestion].scenario.origin}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'graphql_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre',
                  color: '#d4d4d4'
                }}
              >
                {questions[currentQuestion].scenario.query}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'cors_config' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre',
                  color: '#d4d4d4'
                }}
              >
                {Object.entries(questions[currentQuestion].scenario.headers)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n')}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'session_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre',
                  color: '#d4d4d4'
                }}
              >
                {JSON.stringify(questions[currentQuestion].scenario.config, null, 2)}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'image' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <ImageWithFallback
                src={questions[currentQuestion].scenario.url}
                fallbackSrc="/images/placeholder.png"
                alt={questions[currentQuestion].scenario.alt || "Question Image"}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'screenshot' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <ImageWithFallback
                src={questions[currentQuestion].scenario.url}
                fallbackSrc="/images/screenshot-placeholder.png"
                alt={questions[currentQuestion].scenario.description || "Screenshot"}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  border: '1px solid #e0e0e0'
                }}
              />
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'diagram' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <ImageWithFallback
                src={questions[currentQuestion].scenario.url}
                fallbackSrc="/images/diagram-placeholder.png"
                alt={questions[currentQuestion].scenario.title || "Security Diagram"}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
              {questions[currentQuestion].scenario.caption && (
                <Typography
                  variant="caption"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  {questions[currentQuestion].scenario.caption}
                </Typography>
              )}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'reset_flow' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Password Reset Flow:
              </Typography>
              <Box sx={{ ml: 2 }}>
                {questions[currentQuestion].scenario.steps.map((step, index) => (
                  <Typography key={index} variant="body2" gutterBottom>
                    {index + 1}. {step}
                  </Typography>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="error.main">
                <strong>Token Type:</strong> {questions[currentQuestion].scenario.token_type}
              </Typography>
              {questions[currentQuestion].scenario.expiry && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Expiry:</strong> {questions[currentQuestion].scenario.expiry}
                </Typography>
              )}
              {questions[currentQuestion].scenario.rate_limit && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Rate Limit:</strong> {questions[currentQuestion].scenario.rate_limit}
                </Typography>
              )}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'cache_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Content Type:</strong> {questions[currentQuestion].scenario.content}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Headers:
              </Typography>
              {Object.entries(questions[currentQuestion].scenario.headers).map(([key, value]) => (
                <Typography key={key} variant="body2" sx={{ ml: 2 }} gutterBottom>
                  <strong>{key}:</strong> {value}
                </Typography>
              ))}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'header_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#d4d4d4' }}>
                Security Headers:
              </Typography>
              {Object.entries(questions[currentQuestion].scenario.headers).map(([key, value]) => (
                <Typography key={key} variant="body2" sx={{ color: '#d4d4d4', ml: 2 }} gutterBottom>
                  <strong>{key}:</strong> {value}
                </Typography>
              ))}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'binary_analysis' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#d4d4d4' }}>
                Binary Characteristics:
              </Typography>
              {Object.entries(questions[currentQuestion].scenario.behavior).map(([key, value]) => (
                <Typography key={key} variant="body2" sx={{ color: value ? 'error.main' : '#d4d4d4', ml: 2 }} gutterBottom>
                  <strong>{key.replace(/_/g, ' ')}:</strong> {value.toString()}
                </Typography>
              ))}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'ids_alert' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#ffebee',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="subtitle1" gutterBottom color="error">
                IDS Alert Details:
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Signature:</strong> {questions[currentQuestion].scenario.signature}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Severity:</strong> {questions[currentQuestion].scenario.severity}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Source:</strong> {questions[currentQuestion].scenario.source}
              </Typography>
              <Typography variant="body2">
                <strong>Pattern:</strong> {questions[currentQuestion].scenario.pattern}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'remote_work' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              {questions[currentQuestion].scenario.options.map((option, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Setup:</strong> {option.setup}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Security Level: {option.security}
                  </Typography>
                  {index < questions[currentQuestion].scenario.options.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'antivirus_alert' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#ffebee',
                border: '2px solid #d32f2f'
              }}
            >
              <Typography variant="subtitle1" gutterBottom color="error" sx={{ fontWeight: 'bold' }}>
                {questions[currentQuestion].scenario.alert}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>File:</strong> {questions[currentQuestion].scenario.file}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Severity:</strong> {questions[currentQuestion].scenario.severity}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {questions[currentQuestion].scenario.actions.map((action, index) => (
                  <Chip
                    key={index}
                    label={action}
                    color={action === 'Quarantine' ? 'error' : 'default'}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'social_media' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f8f9fa'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src={questions[currentQuestion].scenario.profile.photo}
                  alt="Profile"
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    mr: 2,
                    backgroundColor: '#e0e0e0'
                  }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {questions[currentQuestion].scenario.profile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {questions[currentQuestion].scenario.profile.title}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" gutterBottom>
                <strong>Connections:</strong> {questions[currentQuestion].scenario.profile.connections}
              </Typography>
              <Typography variant="body2">
                <strong>Joined:</strong> {questions[currentQuestion].scenario.profile.joined}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'qr_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#fff4e5',
                border: '1px solid #ed6c02'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Location:</strong> {questions[currentQuestion].scenario.location}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Content:</strong> {questions[currentQuestion].scenario.content}
              </Typography>
              <Typography variant="body2" color="warning.main">
                <strong>Condition:</strong> {questions[currentQuestion].scenario.appearance}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'voice_phishing' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#ffebee'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Caller:</strong> {questions[currentQuestion].scenario.caller}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Time:</strong> {questions[currentQuestion].scenario.time}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line',
                  fontStyle: 'italic'
                }}
              >
                {questions[currentQuestion].scenario.message}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'iot_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Device:</strong> {questions[currentQuestion].scenario.device}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Network:</strong> {questions[currentQuestion].scenario.network}
              </Typography>
              <Typography variant="body2" color="error.main">
                <strong>Behavior:</strong> {questions[currentQuestion].scenario.behavior}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'mobile_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Symptoms:
              </Typography>
              <Box sx={{ ml: 2, mb: 2 }}>
                {questions[currentQuestion].scenario.symptoms.map((symptom, index) => (
                  <Typography key={index} variant="body2" gutterBottom>
                    • {symptom}
                  </Typography>
                ))}
              </Box>
              <Typography variant="body2" color="warning.main">
                <strong>Recent Change:</strong> {questions[currentQuestion].scenario.recent_changes}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'meeting_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Platform:</strong> {questions[currentQuestion].scenario.platform}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Meeting Type:</strong> {questions[currentQuestion].scenario.meeting}
              </Typography>
              <Typography variant="body2" color="primary">
                <strong>Request:</strong> {questions[currentQuestion].scenario.request}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'app_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {questions[currentQuestion].scenario.app.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Platform:</strong> {questions[currentQuestion].scenario.platform}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Rating:</strong> {questions[currentQuestion].scenario.app.rating}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Downloads:</strong> {questions[currentQuestion].scenario.app.downloads}
              </Typography>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Requested Permissions:
              </Typography>
              <Box sx={{ ml: 2 }}>
                {questions[currentQuestion].scenario.app.permissions.map((permission, index) => (
                  <Typography key={index} variant="body2" color="error">
                    • {permission}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'privacy_settings' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Device:</strong> {questions[currentQuestion].scenario.device}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Request:</strong> {questions[currentQuestion].scenario.request}
              </Typography>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Data Types:
              </Typography>
              <Box sx={{ ml: 2 }}>
                {questions[currentQuestion].scenario.data_types.map((type, index) => (
                  <Typography key={index} variant="body2" color="primary">
                    • {type}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'container_config' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#d4d4d4' }}>
                Dockerfile Configuration:
              </Typography>
              {Object.entries(questions[currentQuestion].scenario.dockerfile).map(([key, value]) => (
                <Typography key={key} variant="body2" sx={{ color: '#d4d4d4', ml: 2 }} gutterBottom>
                  <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value.toString()}
                </Typography>
              ))}
              <Divider sx={{ my: 1, borderColor: '#666' }} />
              <Typography variant="subtitle2" sx={{ color: '#d4d4d4', mt: 1 }}>
                Security Risks:
              </Typography>
              {questions[currentQuestion].scenario.risks.map((risk, index) => (
                <Typography key={index} variant="body2" sx={{ color: 'error.main', ml: 2 }}>
                  • {risk}
                </Typography>
              ))}
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'vm_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Attack Vector:</strong> {questions[currentQuestion].scenario.attack.vector}
              </Typography>
              <Typography variant="body2" sx={{ color: '#d4d4d4' }}>
                <strong>Target:</strong> {questions[currentQuestion].scenario.attack.target}
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.main' }}>
                <strong>Payload:</strong> {questions[currentQuestion].scenario.attack.payload}
              </Typography>
            </Paper>
          )}

          {questions[currentQuestion].scenario?.type === 'boot_security' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace'
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#d4d4d4' }}>
                UEFI Configuration:
              </Typography>
              {Object.entries(questions[currentQuestion].scenario.uefi).map(([key, value]) => (
                <Typography key={key} variant="body2" sx={{ color: '#d4d4d4', ml: 2 }} gutterBottom>
                  <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                </Typography>
              ))}
            </Paper>
          )}

          <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
            <RadioGroup value={selectedAnswer} onChange={handleAnswerSelect}>
              {questions[currentQuestion].options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                  disabled={isAnswered}
                  sx={{
                    marginY: 1,
                    padding: 1,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {showExplanation && (
            <Alert
              severity={selectedAnswer === questions[currentQuestion].correctAnswer ? "success" : "error"}
              sx={{ mt: 2 }}
            >
              {questions[currentQuestion].explanation}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3,
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              disabled={selectedAnswer === null || isAnswered}
              onClick={handleSubmit}
              fullWidth={true}
              sx={{ order: { xs: 2, sm: 1 } }}
            >
              Submit Answer
            </Button>
            <Button
              variant="outlined"
              color="primary"
              disabled={!isAnswered}
              onClick={handleNext}
              fullWidth={true}
              sx={{ order: { xs: 1, sm: 2 } }}
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </PreventTabSwitch>
  );
}

export default QuizPage; 