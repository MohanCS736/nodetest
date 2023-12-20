require('dotenv').config();

// Update the import statement to match the correct case
const transporter = require('../config/mailer');

class sendMail{

    async generateMail(senderMail, subject, html) {

        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: senderMail,
            subject: subject,
            html: html,
        };
        
        // Send Mail
        transporter.sendMail(mailOptions, (error, info) => {
            let $message = '';
            if (error) {
                $message =  'Error sending email:' + error;
            } else {
                $message =  'Email sent:', info.response;
            }
            return $message;
        });
    }
}
module.exports = sendMail;



