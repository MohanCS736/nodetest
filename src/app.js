const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
// const userWatchedDocumentsModel = require('./models/userWatchedDocuments');
// const userModel = require('./models/users');
// const resourceModel = require('./models/resources');
app.use(
  cors({
    exposedHeaders: ["Content-Disposition"], // Specify the headers to expose
  })
);
// app.use(express.json());
const user = require("./routes/user");
const subjects = require("./routes/subjects");
const resources = require("./routes/resources");
const reports = require("./routes/reports");
const multer = require("multer");
app.use(
  "/images/subjects",
  express.static(path.join(__dirname, "storage/subjects"))
);
app.use(
  "/images/courses",
  express.static(path.join(__dirname, "storage/courses"))
);
app.use(
  "/images/documents",
  express.static(path.join(__dirname, "storage/documents"))
);
app.use(
  "/user/profilePic",
  express.static(path.join(__dirname, "storage/profilePics"))
);
/**set the document path to access globaly */
global.documentPath = `${__dirname}/storage/documents`;

/**test routes */
// app.get('/test',async(req,res)=>{
//     const test = await userWatchedDocumentsModel.findAll({
//       include:[{model:userModel},{model:resourceModel}]
//     })
//     res.send(test);
// });
/**main routes */
app.use("/", user);
app.use("/subjects", subjects);
app.use("/resources", resources);
app.use("/reports", reports);

app.use((err, req, res, next) => {
  console.log(err);
  if (err instanceof multer.MulterError) {
    // A Multer error occurred (e.g., file size exceeded)
    return res.status(400).json({ error: err });
  } else if (err) {
    // An unexpected error occurred
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
  next();
});
module.exports = app;
