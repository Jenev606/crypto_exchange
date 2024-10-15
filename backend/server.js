const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

let monocoinPrice = 100;

// Ендпоінт для отримання ціни
app.get('/price', (req, res) => {
  const randomChange = (Math.random() - 0.5) * 10;
  monocoinPrice = Math.max(1, monocoinPrice + randomChange);
  res.json({ price: monocoinPrice });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
