const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'catdb'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// Get all cats
app.get('/cats', (req, res) => {
  db.query('SELECT * FROM cats', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get one cat
app.get('/cats/:id', (req, res) => {
  db.query('SELECT * FROM cats WHERE id = ?', [req.params.id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// Add new cat
app.post('/cats', (req, res) => {
  db.query('INSERT INTO cats SET ?', req.body, (err, result) => {
    if (err) throw err;
    res.json({ message: 'Cat added', id: result.insertId });
  });
});

// Update cat
app.put('/cats/:id', (req, res) => {
  db.query('UPDATE cats SET ? WHERE id = ?', [req.body, req.params.id], err => {
    if (err) throw err;
    res.json({ message: 'Cat updated' });
  });
});

// Delete cat
app.delete('/cats/:id', (req, res) => {
  db.query('DELETE FROM cats WHERE id = ?', [req.params.id], err => {
    if (err) throw err;
    res.json({ message: 'Cat deleted' });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
