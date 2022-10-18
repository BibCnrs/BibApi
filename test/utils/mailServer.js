import request from 'request-promise';
import { mailServer } from 'config';

export const getAllMails = async () =>
    request
        .get(`http://${mailServer.host}/email`)
        .then(JSON.parse)
        .then(
            (response) =>
                response &&
                response.map(({ from, to, subject, html, text }) => ({
                    from,
                    to,
                    subject,
                    html,
                    text,
                })),
        )
        .catch((error) => error);

export const clearMails = async () =>
    request.del(`http://${mailServer.host}/email/all`);
