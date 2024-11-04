const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { connectToDatabase } = require("./db");

const { UserModel, TodoModel } = require("./db");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "jarvis0000";
const app = express();

app.use(cors());
app.use(express.json());

//// establish a connection to mongo DB database
connectToDatabase().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

//user.js code start from here
//signup ,signin route ...

app.post("/signup", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use " });
    }

    await UserModel.create({
      email: email,
      username: username,
      password: password,
    });
    res.json({
      message: "you have signed up",
    });
  } catch (error) {
    res.status(500).json({ message: "error signing up", error });
  }
});

app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await UserModel.findOne({
      email: email,
      password: password,
    });

    if (user) {
      const token = jwt.sign(
        {
          // create jwt token
          id: user._id,
        },
        JWT_SECRET
      );

      res.json({
        token: token,
      });
    } else {
      res.status(403).json({
        message: "incorrect creds",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error });
  }
});

//middleware
function auth(req, res, next) {
  const token = req.headers.token;

  try {
    const decodedData = jwt.verify(token, JWT_SECRET);
    req.userId = decodedData.id;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

// todo.js code from here

app.post("/todo", auth, async function (req, res) {
  try {
    const title = req.body.title;
    const description = req.body.description;

    const newTodo = await TodoModel.create({
      userId: req.userId,
      title,
      description,
    });
    res.json({
      message: "Todo created",
      todo: newTodo,
    });
  } catch (error) {
    res.status(500).json({ message: "error creating todo", error });
  }
});

//getting all todos
app.get("/todos", auth, async function (req, res) {
  try {
    const todos = await TodoModel.find({ userId: req.userId });
    res.json({ todos });
  } catch (error) {
    res.status(500).json({ message: "error fetching todos", error });
  }
});

module.exports = { auth, JWT_SECRET };
