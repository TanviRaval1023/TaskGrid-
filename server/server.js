require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//const { sendTaskReminderEmail } = require("./services/emailService");

const { startReminderScheduler } = require("./scheduler/reminderScheduler");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

const PORT = 5000;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    // Start the automatic task reminder scheduler
    startReminderScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  });

app.get("/", (req, res) => {
  res.json({
    message: "TaskGrid server is running!"
  });
});