const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


// FUNCTION: Send the daily TaskGrid reminder email
async function sendTaskReminderEmail(
  recipientEmail,
  recipientName,
  pendingTasks
) {
  const taskList = pendingTasks
    .map((task) => `• ${task.title}`)
    .join("\n");

  const taskCount = pendingTasks.length;

  await transporter.sendMail({
    from: `"TaskGrid" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "TaskGrid — Your daily task reminder",

    text: `Hello ${recipientName},

You have ${taskCount} pending task${taskCount === 1 ? "" : "s"} for today:

${taskList}

Don't forget to complete them!

Open TaskGrid:
https://taskgrid-client.onrender.com/

— TaskGrid`
  });
}


// FUNCTION: Send password reset email
async function sendPasswordResetEmail(
  recipientEmail,
  recipientName,
  resetLink
) {
  await transporter.sendMail({
    from: `"TaskGrid" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "TaskGrid — Reset your password",

    text: `Hello ${recipientName},

We received a request to reset your TaskGrid password.

Click the link below to create a new password:

${resetLink}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

— TaskGrid`
  });
}


module.exports = {
  sendTaskReminderEmail,
  sendPasswordResetEmail
};