export const domains = function* domains() {
    const communities = yield this.communityQueries.selectPage();
    this.body = communities.map(({ name, gate, ebsco }) => ({
        name,
        gate,
        ebsco,
    }));
};
