import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Display({ tableName }) {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/tabledata/${tableName}`);
        setTableData(response.data);
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
    };

    fetchTableData();
  }, [tableName]);

  return (
    <div>
      <h2>Table Data</h2>
      <table>
        <thead>
          <tr>
            {/* Assuming the first row of the data contains column headers */}
            {tableData.length > 0 && Object.keys(tableData[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Display;
