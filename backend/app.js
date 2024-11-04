const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://yadavrajat1210:SvxcRQbt7AsgVxW9@cluster0.7n7wv.mongodb.net/todo-app2"
);
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "1223";
const app = express();

app.use(cors());
app.use(express.json());

const users = []; // global user variable

app.post("/signup", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  await UserModel.create({
    email: email,
    username: username,
    password: password,
  });
  res.json({
    message: "you have signed up",
  });
});

app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

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
});

//middleware
function auth(req, res, next) {
  const token = req.headers.token;

  const decodedData = jwt.verify(token, JWT_SECRET);

  if (decodedData) {
    req.userId = decodedData.userId;
    next();
  } else {
    res.status(403).json({
      message: "incorrect creds",
    });
  }
}

module.exports = {
  auth,
  JWT_SECRET,
};

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

app.get("/todos", auth, async function (req, res) {
  try {
    const todos = await TodoModel.find({ userId: req.userId });
    res.json({ todos });
  } catch (error) {
    res.status(500).json({ message: "error fetching todos", error });
  }
});
app.listen(3000, () => {
  console.log("server is running on port 3000");
});
