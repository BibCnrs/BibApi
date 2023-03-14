import { debugEbscoResult } from 'config';

import searchPublication from '../../services/searchPublication';
import searchPublicationParser from '../../services/searchPublicationParser';
import { parsePublicationSearch } from '../../services/parseSearchQuery';
import getInfoFromDOAJ from '../../services/getInfoFromDOAJ';

export const publicationSearch = function* publicationSearch() {
    const query = parsePublicationSearch(this.query);

    try {
        const result = yield searchPublication(
            this.domain,
            this.ebscoToken,
        )(query);

        const parsedResult = yield searchPublicationParser(
            result,
            this.domain.name,
        );

        for (let item of parsedResult.results) {
            try {
                item.isDiamond = false;
                if (item.issnPrint && item.issnPrint.length > 0) {
                    const formatedIssn =
                        item.issnPrint[0].slice(0, 4) +
                        '-' +
                        item.issnPrint[0].slice(4);
                    const doajInfo = yield getInfoFromDOAJ(formatedIssn);
                    item.isDiamond = doajInfo.has_apc === false;
                }
                if (
                    item.isDiamond === false &&
                    item.issnOnline &&
                    item.issnOnline.length > 0
                ) {
                    const formatedIssn =
                        item.issnOnline[0].slice(0, 4) +
                        '-' +
                        item.issnOnline[0].slice(4);
                    const doajInfo = yield getInfoFromDOAJ(formatedIssn);
                    item.isDiamond = doajInfo.has_apc === false;
                    continue;
                }
            } catch (e) {
                item.isDiamond = false;
            }
        }

        if (debugEbscoResult) {
            this.body = {
                ...parsedResult,
                unparsed: result,
            };
            return;
        }
        this.body = parsedResult;
    } catch (error) {
        yield this.ebscoToken.invalidateAuth(this.domain.name);
        if (error.message === 'Max retry reached. Giving up.') {
            this.status = 401;
            this.body =
                'Could not connect to ebsco api. Please try again. If the problem persist contact us.';
            return;
        }
        throw error;
    }
};
