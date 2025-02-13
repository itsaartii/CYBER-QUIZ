import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';

const PreventTabSwitch = ({ children, isQuizActive }) => {
  const navigate = useNavigate();
  const [warningCount, setWarningCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showRightClickWarning, setShowRightClickWarning] = useState(false);
  const maxWarnings = 3;

  useEffect(() => {
    if (!isQuizActive) return;

    // Add style to prevent text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';

    const handleContextMenu = (e) => {
      e.preventDefault();
      setShowRightClickWarning(true);
    };

    const handleKeyDown = (e) => {
      // Prevent keyboard shortcuts that could be used to bypass restrictions
      if (
        // Prevent F12 key
        e.key === 'F12' ||
        // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        // Prevent Ctrl+U
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        setShowRightClickWarning(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isQuizActive) {
        const newWarningCount = warningCount + 1;
        setWarningCount(newWarningCount);

        if (newWarningCount >= maxWarnings) {
          setIsFullScreen(false);
          alert('Quiz aborted due to multiple tab switches!');
          
          try {
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(err => {
                console.log('Error exiting fullscreen:', err);
              });
            }
          } catch (error) {
            console.log('Could not exit fullscreen:', error);
          }
          
          navigate('/');
        } else {
          alert(`Warning: ${newWarningCount}/${maxWarnings} - Please don't switch tabs during the quiz!`);
        }
      }
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && isQuizActive) {
        const newWarningCount = warningCount + 1;
        setWarningCount(newWarningCount);

        if (newWarningCount >= maxWarnings) {
          setIsFullScreen(false);
          alert('Quiz aborted due to exiting full-screen mode multiple times!');
          navigate('/');
        } else {
          alert(`Warning: ${newWarningCount}/${maxWarnings} - Please stay in full-screen mode!`);
          requestFullscreen();
        }
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    // Remove event listeners on cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      
      // Reset text selection on cleanup
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.msUserSelect = '';
      document.body.style.mozUserSelect = '';
      
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => {
            console.log('Error exiting fullscreen on cleanup:', err);
          });
        }
      } catch (error) {
        console.log('Could not exit fullscreen on cleanup:', error);
      }
    };
  }, [isQuizActive, warningCount, navigate]);

  const requestFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
      setIsFullScreen(true);
    }
  };

  if (!isQuizActive) {
    return children;
  }

  if (!isFullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          p: 3
        }}
      >
        <Typography variant="h5" gutterBottom>
          Please Enter Full Screen Mode to Start the Quiz
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          The quiz requires full-screen mode to maintain academic integrity.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={requestFullscreen}
        >
          Enter Full Screen Mode
        </Button>
      </Box>
    );
  }

  return (
    <>
      {children}
      <Snackbar
        open={showRightClickWarning}
        autoHideDuration={3000}
        onClose={() => setShowRightClickWarning(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowRightClickWarning(false)} 
          severity="warning"
          sx={{ width: '100%' }}
        >
          Right-click and keyboard shortcuts are disabled during the quiz
        </Alert>
      </Snackbar>
    </>
  );
};

export default PreventTabSwitch; 