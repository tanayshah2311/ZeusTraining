import React, { useEffect, useState } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidth((prevWidth) => {
        if (prevWidth >= progress) {
          clearInterval(interval);
          return progress;
        }
        return prevWidth + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${width}%` }}>
        {width}%
      </div>
    </div>
  );
};

export default ProgressBar;
