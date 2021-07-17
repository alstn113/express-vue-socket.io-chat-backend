const express = require("express");
const Room = require("../models/room");
const Chat = require("../models/chat");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const roomList = await Room.findAll({});
    res.json(roomList);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newRoom = await Room.create({
      title: req.body.room.title,
      max: req.body.room.max,
      owner: req.body.room.owner,
      password: req.body.room.password,
    });
    console.log("room 생성 id: " + newRoom.id + ", password: " + newRoom.password + ", owner: " + newRoom.owner);
    const io = req.app.get("io");
    io.of("/room").emit("newRoom", newRoom);
    return res.send({ id: newRoom.id, owner: newRoom.owner, password: newRoom.password });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/:roomId", async (req, res, next) => {
  try {
    const room = await Room.findOne({
      where: { id: req.params.roomId },
    });
    if (!room) {
      const msg = encodeURIComponent("방이 존재하지 않습니다");
      return res.json({ status: 400, msg: msg });
    }
    if (room.password && room.password !== req.query.password) {
      const msg = encodeURIComponent("비밀번호가 옳바르지 않습니다");
      return res.json({ status: 400, msg: msg });
    }
    const io = req.app.get("io");
    const currentRoom = io.of("/room").adapter.rooms.get(req.params.roomId);
    // 특정 네임스페이스의 특정 룸에 연결된 소켓 배열
    const userCount = currentRoom ? currentRoom.size : 0;
    if (room.max <= userCount) {
      const msg = encodeURIComponent("허용인원을 초과하였습니다");
      return res.json({ status: 400, msg: msg });
    }
    return res.json({ status: 200 });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/:roomId/chat", async (req, res, next) => {
  try {
    const chatList = await Chat.findAll({
      where: { room_id: req.params.roomId },
    });
    res.json(chatList);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:roomId/chat", async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room_id: req.params.roomId,
      chat: req.body.message.message,
      user: req.body.message.user,
    });
    console.log("네임스페이스 room -> " + req.params.roomId + " -> chat: " + chat.chat + ", user: " + chat.user);
    res.send("ok");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
