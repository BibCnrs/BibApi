const sortByLetter = databases => databases.reduce((result, database) => ({
    ...result,
    [database.name[0]]: (result[database.name[0]] || []).concat(database),
}), {});

export const database = function* database(domainName) {
    if (typeof domainName !== 'string') {
        const databases = yield this.databaseQueries.selectPage();

        return this.body = sortByLetter(databases);
    }
    const community = yield this.communityQueries.selectOneByName(domainName);

    const databases = yield this.databaseQueries.selectPage(null, null, { community_id: [community.id] }, 'name', 'ASC');
    return this.body = sortByLetter(databases);
};
