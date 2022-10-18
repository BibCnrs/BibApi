import nodemailer from 'nodemailer';
import { mailServer } from 'config';

const transporter = nodemailer.createTransport({
    host: mailServer.host,
    port: mailServer.port,
    ignoreTLS: true,
});

export const mailSender = (transporter) => (mail) => {
    if (!mail) {
        return;
    }
    return new Promise((resolve, reject) => {
        transporter.sendMail(mail, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
};

export default mailSender(transporter);
