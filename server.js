const express = require("express");
require('dotenv').config()
const cookieParser = require("cookie-parser");
let jwt = require('jsonwebtoken');
const app = express();
app.use(cookieParser());
let privateKey = process.env.JWT_SECRET_KEY || "supersecretpassword";


const auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, privateKey);
    req.userRole = data.role;
    return next();
  } catch {
    console.log("caught");
    return res.sendStatus(403);
  }
};

app.get("/", (req, res) => {
  let accessToken = jwt.sign({"role":"member"}, privateKey);
  console.log(privateKey);
  console.log(process.env.FLAG);
  return res.cookie("token", accessToken).status(200).send('Happy hacking! <a href="https://github.com/thekevinchau/JWTCTF1/blob/main/server.js">Code</a>');
});

app.get("/secretRoute", auth, (req, res) => {
  if (req.userRole == "member"){
    return res.json({role: "member", flag: "You do not have access to the flag!"});
  }
  if (req.userRole == "owner"){
    return res.json({role: "owner", flag: process.env.FLAG});
  }
  return res.json({role: req.userRole});
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
})
