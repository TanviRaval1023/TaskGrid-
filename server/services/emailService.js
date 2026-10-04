const RESEND_API_URL = "https://api.resend.com/emails";

async function sendEmail({ to, subject, text }) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",

    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      from: "TaskGrid <onboarding@resend.dev>",
      to: [to],
      subject,
      text
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to send email"
    );
  }

  return data;
}


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

  await sendEmail({
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
  await sendEmail({
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