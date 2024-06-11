import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProgressBar from './ProgressBar';

function App() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileURL, setUploadedFileURL] = useState(null);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);



  function handleChange(event) {
    setFile(event.target.files[0]);
    setUploadProgress(0);
    setUploadedFileURL(null);
    setError(null);
    setParsedData(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const url = `${process.env.REACT_APP_BACKEND_URL}/uploadfile`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: function (progressEvent) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      },

      
    };

    axios.post(url, formData, config)
      .then((response) => {
        console.log(response.data);
        setUploadedFileURL(response.data.fileUrl);
        setParsedData(response.data.data);
      })
      .catch((error) => {
        console.error('Error uploading file: ', error);
        setError(error);
      });
  }


  return (
    <div className="App">
      <div className="container">
        <h1>CSV File Upload</h1>
        <form onSubmit={handleSubmit}>
          <div className="file-input-container">
            <label htmlFor="file-input" className="button-64">
              <span className="text">Choose File</span>
              <input
                id="file-input"
                type="file"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
            </label>
            <div className="file-name">{file ? file.name : 'No file chosen'}</div>
          </div>
          <button type="submit" className="upload-btn">Upload</button>
        </form>
        <ProgressBar progress={uploadProgress} />
        {error && <p className="error-message">Error uploading file: {error.message}</p>}
        {parsedData && (
          <div className="success-container">
            <p className="success-message">File uploaded and parsed successfully!</p>
            <pre>{JSON.stringify(parsedData, null, 2)}</pre>
          </div>
        )}

        
        </div>
        </div>
);
}

export default App;

