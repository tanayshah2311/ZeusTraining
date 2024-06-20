/*import React, { useEffect, useState } from 'react';
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
*/
import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div>
      <label htmlFor="progress-bar">Upload Progress: {progress}%</label>
      <progress id="progress-bar" value={progress} max="100" />
    </div>
  );
};

export default ProgressBar;
