const nodemailer = require("nodemailer");

const sendScheduleEmail = async (toEmail, userName, scheduleHtml) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Kings Intl" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "📅 Your Class Schedule for Tomorrow",
    html: `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Here is your class schedule for <b>tomorrow</b>:</p>
      <ul>${scheduleHtml}</ul>
      <p>Stay prepared and best of luck! 🎓</p>
      <br />
      <small>This is an automated email from Kings International Institute.</small>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendScheduleEmail;
