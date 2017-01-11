const sortByLetter = databases => databases.reduce((result, database) => ({
    ...result,
    [database.name[0]]: (result[database.name[0]] || []).concat(database),
}), {});

export const database = function* database() {
    const databases = yield this.databaseQueries.selectPage();

    return this.body = sortByLetter(databases);
};
