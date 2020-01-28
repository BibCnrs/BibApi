var postgres = require('migrat-postgres');
var config = require('config');

module.exports = {
    migrationsDir: './migrations',

    // REQUIRED. Where the current migration state specific to the
    // current machine is to be stored. This is only used to for
    // migrations created with the `--all-nodes` flag. Make sure
    // it is writable by the user executing migrat and isn't wiped
    // out between deploys.
    localState: './.migratdb',
    plugins: [
        postgres({
            host: config.postgres.host,
            port: config.postgres.port,
            user: config.postgres.user,
            password: config.postgres.password,
            database: config.postgres.database,
            migratSchema: 'public',
            migratTable: 'migrat',
            enableLocking: true,
            enableStateStorage: true,
        }),
    ],
};
