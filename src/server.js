import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import { createServer } from 'http';
import { initSocket } from './services/socketService.js';

dotenv.config();

const port = process.env.PORT || 5000;
const httpServer = createServer(app);

connectDB();
initSocket(httpServer);

httpServer.listen(port, () => console.log(`Server running on port ${port}`));