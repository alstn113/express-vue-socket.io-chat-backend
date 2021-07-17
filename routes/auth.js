const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();

router.post("/signUp", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.json({ error: "이미 존재하는 유저입니다" });
    }
    const hash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password: hash,
    });
    return res.json({ user: newUser });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/signIn", (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.json({ error: info.error });
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.json({ id: user.id, email: user.email });
    });
  })(req, res, next);
});

router.post("/signOut", (req, res, next) => {
  req.logout();
  res.json({ success: true });
});

module.exports = router;
