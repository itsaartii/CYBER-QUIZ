import React, { useEffect, useState, useCallback } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import './ThemeManager.css';

const ThemeManager = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize state with localStorage value or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  useEffect(() => {
    // Update the document class and localStorage when theme changes
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
    </button>
  );
};

export default React.memo(ThemeManager); 