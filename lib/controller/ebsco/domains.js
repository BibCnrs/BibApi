export const domains = function* domains() {
    this.body = (yield this.communityQueries.selectPage(null, null, { ebsco: true })).map(community => community.name);
};
