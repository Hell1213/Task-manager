const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
c;

const User = new Schema({
  name: String,
  email: String,
  password: String,
});

const Todo = new Schema({
  userId: ObjectId,
  title: String,
  done: Boolean,
});

const UserModel = mongoose.model("users", User);
const TodoModel = mongoose.model("todos", Todo);

module.exports = {
  connectToDatabase,
  UserModel,
  TodoModel,
};
