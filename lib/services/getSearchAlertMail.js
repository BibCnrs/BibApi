import { mailServer } from 'config';
import getSearchAlertMailHtml from './getSearchAlertHtml';
import getSearchAlertMailText from './getSearchAlertText';

export default (
    records,
    gate,
    queries,
    domain,
    limiters,
    activeFacets,
    mail,
) => {
    return {
        from: mailServer.from,
        to: mail,
        subject: `Alerte : ${
            records.length
        } nouveau(x) résultat(s) pour votre recherche BibCnrs`,
        html: getSearchAlertMailHtml(
            records,
            gate,
            queries,
            domain,
            limiters,
            activeFacets,
        ),
        text: getSearchAlertMailText(
            records,
            gate,
            queries,
            domain,
            limiters,
            activeFacets,
        ),
    };
};
