const express = require('express');
const cors = require('cors');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/devices', deviceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Smart Farming Backend' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
