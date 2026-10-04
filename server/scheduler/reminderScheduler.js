const cron = require("node-cron");
const User = require("../models/User");
const Task = require("../models/Task");
const {
  sendTaskReminderEmail
} = require("../services/emailService");


// FUNCTION: Start the automatic reminder scheduler
function startReminderScheduler() {

  // TEMPORARY TEST SCHEDULE
  // Runs every day at 9:00 PM
  cron.schedule("0 21 * * *", async () => {

    console.log("Checking for pending tasks...");

    try {

      // Get all registered users
      const users = await User.find();

      // Check each user's pending tasks
      for (const user of users) {

        const pendingTasks = await Task.find({
          userId: user._id,
          status: "pending"
        });

        // Only send an email if the user has pending tasks
        if (pendingTasks.length > 0) {

          await sendTaskReminderEmail(
            user.email,
            user.name,
            pendingTasks
          );

          console.log(
            `Reminder sent to ${user.email}`
          );
        }
      }

    } catch (error) {

      console.error(
        "Reminder scheduler error:"
      );

      console.error(error.message);
    }
  });

  console.log(
    "Reminder scheduler started."
  );
}


// Export the scheduler function
module.exports = {
  startReminderScheduler
};