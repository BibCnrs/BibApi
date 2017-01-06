export const database = function* database(domainName) {
    if (typeof domainName !== 'string') {
        return this.body = (yield this.databaseQueries.selectPage());

    }
    const community = yield this.communityQueries.selectOneByName(domainName);

    return this.body = (yield this.databaseQueries.selectPage(null, null, { community_id: [community.id] }));
};
