const express = require("express");
const cookieParser = require("cookie-parser");
let jwt = require('jsonwebtoken');
const app = express();

let privateKey = process.env.JWT_SECRET_KEY || "SUPERSECRETKEY";//TODO: change this for production

app.use(cookieParser());

const authorization = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).send('You are not registered with the service.');
  }
  try {
    const data = jwt.verify(token, privateKey);
    req.userRole = data.role;
    return next();
  } catch(err) {
    console.log(err);
    console.log("You are not allowed to be here.")
    return res.status(403).send('You are not allowed to be here.')
  }
};

app.get("/", (req, res) => {
  let token = jwt.sign({"role":"user"}, privateKey);
  return res.cookie("token", token).status(200).json({ message: "Welcome to the server. Happy hacking!", "source": "https://github.com/thekevinchau/JWTCTF1"});
});

app.get("/logout", authorization, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Logged out" });
});

app.get("/protected", authorization, (req, res) => {
  if (req.userRole == "user"){
    return res.json({role: "user", flag: "Not quite!"});
  }
  if (req.userRole == "owner"){
    return res.json({role: "owner", flag: process.env.FLAG});
  }
  return res.json({role: req.userRole});
});

const port = 8080
app.listen(port, () => {
    console.log(`Running on port ${port}`)
})