import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Components/pagination';
import ProgressBar from './ProgressBar';

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('Name');
  const [sort, setSort] = useState('Name');
  const [order, setOrder] = useState('ASC');
  const [uploadProgress, setUploadProgress] = useState(0);
  const pageSize = 10;

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
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Uploaded ${progressEvent.loaded} bytes of ${progressEvent.total} bytes (${percentCompleted}%)`);
        setUploadProgress(percentCompleted);
      },
    })
      .then((response) => {
        alert(response.data.message);
        setUploadProgress(0);
        fetchTableData(1);
      })
      .catch((error) => {
        console.error('Error uploading file: ', error);
        setError(error.message);
        setUploadProgress(0);
      });
  }

  const fetchTableData = async (page) => {
    try {
      const response = await axios.get(`http://localhost:4000/tabledata/user`, {
        params: {
          page,
          pageSize,
          search,
          searchBy,
          sort,
          order,
        },
      });
      setTableData(response.data.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  const handlePageChange = (pageNumber) => {
    fetchTableData(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTableData(1);
  };

  useEffect(() => {
    fetchTableData(1);
  }, []);

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

        {uploadProgress > 0 && <ProgressBar progress={uploadProgress} />}
        
        {error && <p className="error-message">Error uploading file: {error}</p>}

        {tableData.length > 0 && (
          <div className="table-container">
            <h2>Table Data</h2>
            <div className="search-sort-container">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                />
                <select value={searchBy} onChange={handleSearchByChange}>
                  <option value="Name">Name</option>
                  <option value="Email">Email</option>
                  <option value="Contact">Contact</option>
                </select>
                <h5>Sort</h5>
                <select value={sort} onChange={handleSortChange} className='so'>
                  <option value="Name">Name</option>
                  <option value="Email">Email</option>
                  <option value="Contact">Contact</option>
                </select>
                <select value={order} onChange={handleOrderChange} className='os'>
                  <option value="ASC">A-Z</option>
                  <option value="DESC">Z-A</option>
                </select>
                <button type="submit">Search</button>
              </form>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  {['Name', 'Email', 'Contact'].map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((rowData, index) => (
                  <tr key={index}>
                    <td>{rowData.Name}</td>
                    <td>{rowData.Email}</td>
                    <td>{rowData.Contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
