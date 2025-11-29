const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const resourceRoutes = require('./routes/resources');
const { authenticateSocket } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/langhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/resources', resourceRoutes);

// Socket.io connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.id);

  // Join user's personal room
  socket.join(`user_${socket.user.id}`);

  // Join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.user.id} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User ${socket.user.id} left chat ${chatId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const Message = require('./models/Message');
      const Chat = require('./models/Chat');

      const message = new Message({
        chat: data.chatId,
        sender: socket.user.id,
        content: data.content,
        messageType: data.messageType || 'text'
      });

      await message.save();

      // Update chat last message
      await Chat.findByIdAndUpdate(data.chatId, {
        lastMessage: message._id,
        lastActivity: new Date()
      });

      // Emit to all users in the chat room
      io.to(`chat_${data.chatId}`).emit('new_message', {
        message: await message.populate('sender', 'name email avatar')
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_typing', {
      userId: socket.user.id,
      userName: socket.user.name,
      chatId: data.chatId
    });
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_stopped_typing', {
      userId: socket.user.id,
      chatId: data.chatId
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };

