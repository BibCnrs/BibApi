import co from 'co';
import config from 'config';
import { PgPool } from 'co-postgres-queries';
import subMonths from 'date-fns/sub_months';

import History from '../../lib/models/History';

co(function* () {
    const db = new PgPool({
        user: config.postgres.user,
        password: config.postgres.password,
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
    });
    const historyQueries = History(db);
    const oldestDate = subMonths(
        new Date(),
        config.maxSearchHistoryAgeInMonths,
    );

    const entries = yield historyQueries.deleteEntriesCreatedBeforeThan(
        oldestDate,
    );
    global.console.log(`Deleted ${entries[0].count} history entries`);
})
    .catch(function (error) {
        global.console.error(error.stack);

        return error;
    })
    .then(function (error) {
        process.exit(error ? 1 : 0);
    });
