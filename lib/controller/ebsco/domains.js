export const domains = function* domains() {
    this.body = (yield this.communityQueries.selectPage()).map(community => community.name);
};
