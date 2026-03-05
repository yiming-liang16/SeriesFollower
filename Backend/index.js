import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import listRoutes from './routes/listRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import titleRoutes from './routes/titleRoutes.js';
import listItemRoutes from './routes/listItemRoutes.js';
import { connectDB } from './config/database.js';

const app = express();

connectDB();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.static('public'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


//Routes
app.use('/api/users', userRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/watchlist',watchlistRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/', listItemRoutes);


//Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
    res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});









