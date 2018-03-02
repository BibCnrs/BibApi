import ebscoRequest from './ebscoRequest';

export default function* ebscoAuthentication(userId, password) {
    return yield ebscoRequest('/authservice/rest/UIDAuth', {
        UserId: userId,
        Password: password,
    });
}
