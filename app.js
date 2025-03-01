const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// ✅ Define Routers BEFORE using them
const userRouter = express.Router();
const tourRouter = express.Router();

// ✅ Apply middleware after defining routers
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

// Other routes can be added for tours...

// ✅ User Routes (Example)
userRouter.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'List of users' });
});

// ✅ Good Structured Code for Tours
const toursFile = `${__dirname}/dev-data/data/tours-simple.json`;
let toursData = JSON.parse(fs.readFileSync(toursFile));

const findTourById = (id) => toursData.find((tour) => tour.id === id);
const isInvalidId = (id) => id < 1 || id > toursData.length;

const getTours = (req, res) => {
  res
    .status(200)
    .json({
      status: 'success',
      results: toursData.length,
      data: { tours: toursData },
    });
};

const getTour = (req, res) => {
  const id = Number(req.params.id);
  if (isInvalidId(id))
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({ status: 'success', data: { tour: findTourById(id) } });
};

const createTour = (req, res) => {
  const newTour = {
    id: toursData.length ? toursData[toursData.length - 1].id + 1 : 1,
    ...req.body,
  };
  toursData.push(newTour);
  fs.writeFileSync(toursFile, JSON.stringify(toursData));

  res.status(201).json({ status: 'success', data: { tour: newTour } });
};

const updateTour = (req, res) => {
  if (isInvalidId(Number(req.params.id)))
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res
    .status(200)
    .json({ status: 'success', data: { tour: '<Updated tour here...>' } });
};

const deleteTour = (req, res) => {
  if (isInvalidId(Number(req.params.id)))
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res
    .status(204)
    .json({
      status: 'success',
      message: 'Tour deleted successfully',
      data: null,
    });
};

// ✅ Apply routes for tours
tourRouter.route('/').get(getTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// ✅ User Management System
let users = [];

const findUserById = (id) => users.find((user) => user.id === id);
const isInvalidUserId = (id) => id < 1 || id > users.length;

const getUsers = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
};

const getUser = (req, res) => {
  const id = Number(req.params.id);
  if (isInvalidUserId(id))
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  res.status(200).json({ status: 'success', data: { user: findUserById(id) } });
};

const createUser = (req, res) => {
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    ...req.body,
  };
  users.push(newUser);

  res.status(201).json({ status: 'success', data: { user: newUser } });
};

const updateUser = (req, res) => {
  const id = Number(req.params.id);
  if (isInvalidUserId(id))
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  users = users.map((user) =>
    user.id === id ? { ...user, ...req.body } : user
  );

  res.status(200).json({
    status: 'success',
    data: { user: users.find((user) => user.id === id) },
  });
};

const deleteUser = (req, res) => {
  const id = Number(req.params.id);
  if (isInvalidUserId(id))
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });

  users = users.filter((user) => user.id !== id);

  res
    .status(204)
    .json({
      status: 'success',
      message: 'User deleted successfully',
      data: null,
    });
};

// ✅ Apply routes for users
userRouter.route('/').get(getUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// ✅ Start Server
const port = 3000;
app.listen(port, () => console.log(`App running on port ${port}...`));
