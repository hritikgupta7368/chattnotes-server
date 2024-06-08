const express = require("express");
const cors = require("cors");
const authenticateUser = require("../auth/authentication");
const generateToken = require("../test/generateToken");
const createfolder = require("../routes/folders/createfolder");
const getallfolder = require("../routes/folders/getallfolder");
const deletefolder = require("../routes/folders/deletefolder");
const createpage = require("../routes/pages/createpage");
const getallpage = require("../routes/pages/getallpage");
const deletepage = require("../routes/pages/deletepage");
const register = require("../routes/user/register");
const login = require("../routes/user/login");
const getuser = require("../routes/user/getuser");
const deleteuser = require("../routes/user/deleteuser");

const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//test
app.use("/", generateToken);

//signup/signin
app.use("/", login);
app.use("/", register);

//auth
app.use(authenticateUser);

//user
app.use("/", getuser);
app.use("/", deleteuser);

//folders
app.use("/", createfolder);
app.use("/", getallfolder);
app.use("/", deletefolder);

//pages
app.use("/", createpage);
app.use("/", getallpage);
app.use("/", deletepage);

//contents

const port = process.env.PORT || 4000;
app.listen(port, () => {
  const environment =
    process.env.NODE_ENV !== "production" ? "development" : "production";
  console.log(
    `Server running on ${environment} mode on ${
      environment === "production" ? "vercel" : `http://localhost:${port}`
    }`
  );
});

module.exports = app;
