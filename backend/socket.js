import { Server } from "socket.io";
import Message from "./models/Message.js"; // Import model

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    socket.on("registerUser", ({ userEmail, role }) => {
      socket.userEmail = userEmail;
      socket.role = role;
      console.log(`🔒 ${role} registered as: ${userEmail}`);
    });

    socket.on("sendMessage", async (msg) => {
      const { from, to, text } = msg;

      const message = new Message({ from, to, text });
      await message.save();  // Save to MongoDB

      console.log(`💬 Message from ${from} to ${to}: ${text}`);
      io.emit("receiveMessage", msg); // For now, broadcast to all clients
    });

    socket.on("getMessageHistory", async ({ user1, user2 }) => {
        let messages;
      
        if (user2) {
          messages = await Message.find({
            $or: [
              { from: user1, to: user2 },
              { from: user2, to: user1 },
            ],
          }).sort({ timestamp: 1 });
        } else {
          // Admin is requesting all chats
          messages = await Message.find({
            $or: [{ from: user1 }, { to: user1 }],
          }).sort({ timestamp: 1 });
        }
      
        socket.emit("messageHistory", messages);
      });
      

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.userEmail || socket.id}`);
    });
  });

  return io;
};

export const getSocketInstance = () => io;
