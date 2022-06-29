const nodemailer = require('nodemailer')

const sendEmail =  async options => {
    const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
              user: process.env.USER_EMAIL_USERNAME,
              pass: process.env.USER_PASSWORD
            }
          });
          console.log(process.env.EMAIL_Host,'host')
          console.log(process.env.EMAIL_PORT,'Port')
          console.log(process.env.USER_EMAIL_USERNAME,'EMAIL')
          console.log(process.env.USER_PASSWORD,'PASS')

    const mailOptions = {
        from : process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }
     await transporter.sendMail(mailOptions)
}
module.exports = sendEmail;