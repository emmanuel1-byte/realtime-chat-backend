import dotenv from "dotenv";
dotenv.config();
const { GOOGLE_PASSWORD, GOOGLE_USER } = process.env;
import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";
const mailer = new EventEmitter();
import logger from "../../utils/logger.js";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   port: 465,
//   secure: true,
//   auth: {
//     user: GOOGLE_USER,
//     pass: GOOGLE_PASSWORD,
//   },
// });

async function sendEmail(data) {
  try {
    // const info = await transporter.sendMail({
    //   from: GOOGLE_USER,
    //   to: data.to,
    //   subject: data.subject,
    //   text: data.body,
    // });
    // logger.info(`Email sent successfully: ${info.messageId}`);
    console.log(data.body);
  } catch (err) {
    logger.error(err.message);
    throw new Error(`Error sending email: ${err.message}`);
  }
}
mailer.on("verificationEmail", async (data) => await sendEmail(data));
mailer.on("passwordResetEmail", async (data) => await sendEmail(data));
mailer.on("resendVerficationEmail", async (data) => await sendEmail(data));
mailer.on("sendMagicLinkEmail", async (data) => await sendEmail(data));
export default mailer;
