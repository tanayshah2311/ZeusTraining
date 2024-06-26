const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'fileuploads'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

const upload = multer({ dest: 'uploads/' });

app.post('/uploadfile', upload.single('file'), async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const csvStream = fs.createReadStream(uploadedFile.path);
    const parsedData = await new Promise((resolve, reject) => {
      const parser = csv.parse((error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
      csvStream.pipe(parser);
    });

    const uniqueData = parsedData.slice(1).map(row => [row[0], row[1], row[2]]);
    const updateQuery = `INSERT INTO user (Name, Email, Contact) VALUES ? 
                         ON DUPLICATE KEY UPDATE Name=VALUES(Name), Contact=VALUES(Contact)`;
    await db.promise().query(updateQuery, [uniqueData]);

    console.log('Data inserted or updated successfully');
    res.json({ message: 'File uploaded and processed successfully!' });
    fs.unlinkSync(uploadedFile.path);
  } catch (error) {
    console.error('Error uploading or processing file:', error);
    res.status(500).send('Error processing uploaded file');
  }
});


app.get('/tabledata/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10000;
  const search = req.query.search || '';
  const searchBy = req.query.searchBy || 'Name';
  const sort = req.query.sort || 'Name';
  const order = req.query.order || 'ASC';

  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return res.status(400).send('Invalid table name.');
  }

  // Validate sort column to prevent SQL injection
  const validSortColumns = ['Name', 'Email', 'Contact']; // Add more columns as needed
  if (!validSortColumns.includes(sort)) {
    return res.status(400).send('Invalid sort column.');
  }

  try {
    const whereClause = search ? `WHERE ${searchBy} LIKE ?` : '';
    const searchParam = search ? [`%${search}%`] : [];
    const [rows] = await db.promise().query(`
      SELECT * FROM ${tableName}
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT ${(page - 1) * pageSize}, ${pageSize}
    `, searchParam);

    const [countResult] = await db.promise().query(`
      SELECT COUNT(*) AS total FROM ${tableName}
      ${whereClause}
    `, searchParam);
    const totalRows = countResult[0].total;
    const totalPages = Math.ceil(totalRows / pageSize);

    res.json({ data: rows, currentPage: page, totalPages });
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).send('Error fetching table data');
  }
});




const port = 4000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
