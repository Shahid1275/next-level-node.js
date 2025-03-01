const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// ✅ Define Routers BEFORE using them
const userRouter = express.Router();
const tourRouter = express.Router();

// ✅ Now, apply middleware after defining them
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// ✅ Move this middleware to the top
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ✅ Read data from file (for tours)
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// ✅ Tour Routes
tourRouter.get('/', (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

// ✅ User Routes (Example)
userRouter.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'List of users' });
});

// Server
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
