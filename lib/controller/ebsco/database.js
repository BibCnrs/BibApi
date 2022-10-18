import { getDatabases } from '../../models/Database';

export const database = function* database() {
    return (this.body = yield getDatabases({
        active: true,
    }));
};
