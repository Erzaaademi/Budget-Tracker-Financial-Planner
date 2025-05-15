const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Transaction service running on port ${PORT}`));

app.get('/', (req, res) => {
  res.send('Welcome to the Transaction Service API');
});
