import { getCommunities } from '../../models/Community';

export const domains = function* domains() {
    const communities = yield getCommunities({
        ebsco: true,
    });
    this.body = communities.map(({ name, gate }) => ({ name, gate }));
};
