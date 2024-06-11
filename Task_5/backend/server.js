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

    const headers = parsedData[0];
    const tableName = 'csvdata_' + Date.now();
    const createTableQuery = `CREATE TABLE ${tableName} (${headers.map(header => `\`${header}\` VARCHAR(255)`).join(', ')});`;

    await db.promise().query(createTableQuery);

    const batchSize = 1000;
    for (let i = 1; i < parsedData.length; i += batchSize) {
      const batch = parsedData.slice(i, i + batchSize);
      const insertQuery = `INSERT INTO ${tableName} (${headers.map(header => `\`${header}\``).join(', ')}) VALUES ?`;
      await db.promise().query(insertQuery, [batch]);
    }

    console.log('Data inserted successfully');
    res.json({ message: 'File uploaded and parsed successfully!', tableName });
    fs.unlinkSync(uploadedFile.path);
  } catch (error) {
    console.error('Error uploading or parsing file:', error);
    res.status(500).send('Error processing uploaded file'); 
  }
});





const port = 4000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
