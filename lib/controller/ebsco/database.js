export const sortByLetter = databases => databases.reduce((result, database) => ({
    ...result,
    [database.name_fr[0].toLowerCase()]: (result[database.name_fr[0].toLowerCase()] || []).concat(database),
}), {});

export const database = function* database() {
    const databases = yield this.databaseQueries.selectPage();

    return this.body = sortByLetter(databases);
};
