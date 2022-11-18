import ebscoRequest from './ebscoRequest';

export default function* ebscoSession(profile, token) {
    const response = yield ebscoRequest(
        '/edsapi/rest/CreateSession',
        {
            Profile: profile,
            Guest: 'n',
        },
        token,
    );
    return response;
}
