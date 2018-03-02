export const domains = function* domains() {
    const communities = yield this.communityQueries.selectPage(null, null, {
        ebsco: true,
    });
    this.body = communities.map(({ name, gate }) => ({ name, gate }));
};
