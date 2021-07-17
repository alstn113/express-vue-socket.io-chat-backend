const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/user");

const passportConfig = { usernameField: "email", passwordField: "password" };

const passportVerify = async (email, password, done) => {
  try {
    const exUser = await User.findOne({ where: { email: email } });
    if (exUser) {
      const result = await bcrypt.compare(password, exUser.password);
      if (result) {
        done(null, exUser);
      } else {
        done(null, false, { error: "비밀번호가 일치하지 않습니다." });
      }
    } else {
      done(null, false, { error: "가입되지 않은 회원입니다." });
    }
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = () => {
  passport.use("local", new LocalStrategy(passportConfig, passportVerify));
};
