// server.js
import express from 'express';
import router from './routes/index';

const port = parseInt(process.env.PORT, 10) || 5000;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Load all routes from routes/index.js
app.use('/', router);

// Start the server
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

export default app;

