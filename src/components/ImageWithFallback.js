import React, { useState } from 'react';
import { Box } from '@mui/material';

function ImageWithFallback({ src, alt, fallbackSrc, ...props }) {
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return (
    <Box
      component="img"
      src={error ? fallbackSrc : src}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}

export default ImageWithFallback; 