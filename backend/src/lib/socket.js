import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
});

// used to get the socket id of the receiver
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
//  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

   // io.emit() is used to send events to all the connected clients
   io.emit("getOnlineUsers", Object.keys(userSocketMap));

   
  // Handle joining rooms for group chats
  socket.on('joinRoom', (groupId) => {
    socket.join(groupId);
    // console.log(`User joined room: ${groupId}`);
  });

  // Handle leaving rooms
  socket.on('leaveRoom', (groupId) => {
    socket.leave(groupId);
    // console.log(`User left room: ${groupId}`);
  });

  // Handle group messages
  socket.on('groupMessage', (message) => {
    // Broadcast to all users in the group room except sender
    socket.to(message.groupId).emit('newMessage', message);
  });

   // Add broadcast message handling
   socket.on('broadcastMessage', (message) => {
    // Emit to all connected users except the sender
    Object.keys(userSocketMap).forEach(receiverId => {
      if (receiverId !== message.senderId) {
        io.to(userSocketMap[receiverId]).emit('newMessage', {
          ...message,
          isBroadcast: true,
          receiverId // Add receiver ID for message filtering
        });
      }
    });
  });

 
  socket.on("disconnect", () => {
    // console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

});

export { io, app, server };
