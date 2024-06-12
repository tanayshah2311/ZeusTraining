import './App.css';
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:4000/uploadfile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        alert(response.data.message); 
        fetchTableData(); // Fetch table data after upload
      })
      .catch((error) => {
        console.error('Error uploading file: ', error);
        setError(error.message); // Set error state for display
      });
  }

  const fetchTableData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/tabledata/user');
      setTableData(response.data);
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

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
        
        {error && <p className="error-message">Error uploading file: {error}</p>}
        {tableData.length > 0 && (
          <div className="table-container">
            <h2>Uploaded Data</h2>
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(tableData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
      </div>
      
    </div>
  );
}

export default App;
