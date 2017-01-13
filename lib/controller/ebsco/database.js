

export const database = function* database() {
    return this.body = yield this.databaseQueries.selectPage();
};
