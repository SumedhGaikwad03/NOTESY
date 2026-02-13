const express = require('express');
const app = express();
const port = 5000;
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const routerAuth = require('./routes/auth');
const routerproduct = require('./routes/product');

dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/api/auth', routerAuth);
app.use('/api/product', routerproduct);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("connected to mongodb");
}).catch((err) => {
  console.error('error connecting to mongodb', err);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});