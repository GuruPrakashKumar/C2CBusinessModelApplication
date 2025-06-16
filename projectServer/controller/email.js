
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer')

class Email{
    // async function emailSender(name, email, phone, message) {
    //     const transporter = nodemailer.createTransport(
    //       {
    //         host: "smtp.zoho.in",
    //         port: 465,
    //         secure: true,
    //         auth: {
    //           user: "enquiry@apcinfra.in",
    //           pass: "z82E8ty1MQbC"
    //         }
    //       }
    //     );
    
    //     await transporter.sendMail({
    //       from: "enquiry@apcinfra.in",
    //       to: email,
    //       subject: "Thank you for visiting APC infra",
    //       text: `Hi ${name}!\nMobile: ${phone}\n\nWe are glad that you want to visit our site we will call contact you within 24 hours`
    //     });

    //     await transporter.sendMail({
    //       from: "enquiry@apcinfra.in",
    //       to: "enquiry@apcinfra.in",
    //       subject: `${name} wants to visit site`,
    //       text: `${name} have requested to visit site.\nName: ${name}\nMobile no: ${phone}\nEmail Address.: ${email}\n\n\n${message ? `Message From ${name}:\n${message}` :""}`
    //     });
    // }
    async sendResponse(req, res){
        const email = req.body.email
        const name = req.body.name
        const phone = req.body.phone
        const message = req.body.message
        await emailSender(name,email, phone, message)
        res.status(200).json({message: "email sent"})
    }
}

async function emailSender(name, email, phone, message) {
    const transporter = nodemailer.createTransport(
    {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
        }
    }
    );

    await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Thank you for visiting !",
    text: `Hi ${name}!\nMobile: ${phone}\n\nWe have received your message, will call contact you within 24 hours`
    });

    await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: process.env.SMTP_EMAIL,
    subject: `${name} wants to contact us`,
    text: `${name} have requested to contact us.\nName: ${name}\nMobile no: ${phone}\nEmail Address.: ${email}\n\n\n${message ? `Message From ${name}:\n${message}` :""}`
    });
}

const EmailController = new Email();
module.exports = EmailController;