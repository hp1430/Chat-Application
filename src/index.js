import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'socket.io';

import bullServerAdapter from './config/bullBoardConfig.js';
import connectDB from './config/dbConfig.js';
import { PORT } from './config/serverConfig.js';
import channelSocketHandler from './controllers/channelSocketController.js';
import messageHandlers from './controllers/messageSocketController.js';
import apiRouter from './routes/apiRoutes.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.use('/admin/queues', bullServerAdapter.getRouter());

app.get('/ping', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: 'pong' });
});

app.use('*', (req, res) => {
  return res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: 'Route not found' });
});

io.on('connection', (socket) => {
  // console.log('a user connected', socket.id);

  // socket.on('messageFromClient', (data) => {
  //   console.log('messageFromClient', data);
  // })
  messageHandlers(io, socket);
  channelSocketHandler(io, socket);
});

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
