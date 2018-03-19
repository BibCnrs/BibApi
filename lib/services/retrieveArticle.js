import ebscoEdsRetrieve from './ebscoEdsRetrieve';
import ebscoConnexion from './ebscoConnexion';

export const pureRetrieveArticle = (domain, ebscoToken) =>
    function* pureRetrieveArticle(dbId, an) {
        const result = yield ebscoEdsRetrieve(dbId, an, domain, ebscoToken);

        return result.Record;
    };

export default ebscoConnexion(pureRetrieveArticle);
