import co from 'co';
import config from 'config';
import subMonths from 'date-fns/sub_months';

import { deleteEntriesCreatedBeforeThan } from '../../lib/models/History';

co(function* () {
    const oldestDate = subMonths(
        new Date(),
        config.maxSearchHistoryAgeInMonths,
    );

    const entries = yield deleteEntriesCreatedBeforeThan(oldestDate);
    global.console.log(`Deleted ${entries[0].count} history entries`);
})
    .catch(function (error) {
        global.console.error(error.stack);

        return error;
    })
    .then(function (error) {
        process.exit(error ? 1 : 0);
    });
