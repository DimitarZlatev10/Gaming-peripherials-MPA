const User = require("../models/User");
const { hash, compare } = require("bcrypt");

async function register(firstName, lastName, image, email, password) {
  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await hash(password, 10);

  const user = new User({
    firstName,
    lastName,
    image,
    email,
    hashedPassword,
  });

  await user.save();

  return user;
}

async function login(email, password) {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("Incorrect email or password");
  }

  const hasMatch = await compare(password, user.hashedPassword);

  if (!hasMatch) {
    throw new Error("Incorrect email or password");
  }

  return user;
}

async function getUser(userId) {
  return User.findById(userId).lean();
}

module.exports = {
  register,
  login,
  getUser,
};
