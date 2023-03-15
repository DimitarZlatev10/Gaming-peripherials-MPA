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

module.exports = {
  register,
};
