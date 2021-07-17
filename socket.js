const SocketIO = require("socket.io");
const cookieParser = require("cookie-parser");

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server);
  app.set("io", io);
  const room = io.of("/room");

  const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
  room.use(wrap(cookieParser(process.env.COOKIE_SECRET)));
  room.use(wrap(sessionMiddleware));

  room.on("connection", (socket) => {
    let currentRoomId = null;
    console.log(`${socket.id} room 네임스페이스 접속`);
    socket.on("disconnect", () => {
      if (currentRoomId) {
        socket.to(currentRoomId).emit("chat", { chat: "퇴장", user: "system" });
      }
      console.log(`${socket.id} room 네임스페이스 접속 해제`);
    });

    socket.on("userJoined", (data) => {
      currentRoomId = data.id;
      socket.join(data.id);
      socket.to(data.id).emit("chat", { chat: "입장", user: "system" });
    });
    socket.on("exitRoom", (data) => {
      socket.leave(currentRoomId);
      socket.to(currentRoomId).emit("chat", { chat: "퇴장", user: "system" });
      currentRoomId = null;
    });
    socket.on("newMessage", (data) => {
      io.of("/room").to(currentRoomId).emit("chat", { chat: data.message, user: data.user });
    });
  });
};
