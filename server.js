require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "sistem",
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

const corsOptions = {
  origin: ["http://localhost:3000", "https://sistem.dcism.org"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(fileUpload())

// Define routes or APIs
const userRouter = require("./src/api/user");
app.use('/api/user', userRouter);

const petitionRouter = require("./src/api/petition");
app.use('/api/petition', petitionRouter);

const specialRequestOptionRouter = require("./src/api/special-request-option");
app.use("/api/special-request-option", specialRequestOptionRouter);

const moaRouter = require("./src/api/moa");
app.use("/api/moa", moaRouter);

const specialRequestRouter = require("./src/api/special-request");
app.use("/api/special-request", specialRequestRouter);

const courses = require("./src/api/dcism_course_masterlist");
app.use("/api/dcism_course_masterlist", courses);

const coursesISRouter = require("./src/api/coursesIS");
app.use("/api/coursesIS", coursesISRouter);

const coursesITRouter = require("./src/api/coursesIT");
app.use("/api/coursesIT", coursesITRouter);

const coursesCSRouter = require("./src/api/coursesCS");
app.use("/api/coursesCS", coursesCSRouter);

const notificationRouter = require("./src/api/notification");
app.use("/api/notification", notificationRouter);

// const storage = multer.diskStorage({
//   destination: './uploads',  // Specify the upload directory
//   filename: function (req, file, callback) {
//     // Use the original name of the file
//     callback(null, file.originalname);
//   }
// });

// const upload = multer({ storage: storage });
// app.post('/upload', upload.single('file'), (req, res) => {

//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   res.json({ message: 'File uploaded successfully' });
// });

const gradesRouter = require("./src/api/grades");
app.use('/api/grades', gradesRouter);

const studentStudyPlan = require("./src/api/student-study-plan");
app.use('/api/student-study-plan', studentStudyPlan);

const prospectusRouter = require("./src/api/prospectus");
app.use('/api/prospectus', prospectusRouter);

const suggestedCoursesRouter = require("./src/api/suggested-courses");
app.use('/api/suggested-courses', suggestedCoursesRouter);

const semesterRouter = require('./src/api/semester')
app.use('/api/semester', semesterRouter)

const courseOfferingsRouter = require('./src/api/course-offerings')
app.use('/api/course-offerings', courseOfferingsRouter)

const studentPopulationRouter = require('./src/api/student-population')
app.use('/api/student-population', studentPopulationRouter)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

