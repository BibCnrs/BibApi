import body from 'co-body';
import pick from 'lodash/pick';

import searchArticle from '../../services/searchArticle';
import { getResultsIdentifiers } from '../../services/getMissingResults';

export const getQueryFromHistory = history =>
    history
        ? {
              ...pick(history.event, ['queries', 'activeFacets']),
              ...history.event.limiters,
              resultsPerPage: 100,
          }
        : null;

const frequences = {
    day: '1 day',
    week: '1 week',
    month: '1 month',
    year: '1 year',
};

export const sanitizeFrequence = frequence => {
    const result = frequences[frequence];

    if (!result) {
        throw new Error('Incorrect frequence');
    }

    return result;
};

export const postSearchAlert = function* postSearchAlert() {
    const { historyId, frequence } = yield body(this);
    const history = yield this.historyQueries.selectOne({ id: historyId });
    const query = getQueryFromHistory(history);
    const domainName = history.event.domain;
    const domain = yield this.communityQueries.selectOneByName(domainName);
    const searchResult = yield searchArticle(domain, this.ebscoToken)(query);

    yield this.historyQueries.updateOne(
        { id: historyId },
        {
            has_alert: true,
            frequence: sanitizeFrequence(frequence),
            last_results: JSON.stringify(getResultsIdentifiers(searchResult)),
            last_execution: new Date(),
            nb_results: searchResult.SearchResult.Statistics.TotalHits,
        },
    );

    this.body = {
        done: true,
    };
};

export const delSearchAlert = function* delSearchAlert(id) {
    yield this.historyQueries.updateOne(id, {
        has_alert: false,
        frequence: null,
        last_results: null,
        last_execution: null,
        nb_results: null,
    });

    this.body = {
        done: true,
    };
};
