import retrievePublicationParser from './retrievePublicationParser';
import ebscoPublicationRetrieve from './ebscoPublicationRetrieve';

export default function* retrievePublication(domainName, id, domain, ebscoToken) {
    const { user_id, password, profile } = domain;
    const { authToken, sessionToken} = yield ebscoToken.get(domainName, user_id, password, profile);
    try{
        const result = yield ebscoPublicationRetrieve(id, sessionToken, authToken);
        return  yield retrievePublicationParser(result.Record);
    } catch (error) {
        yield ebscoToken.invalidate(domainName);
        throw error;
    }
}
