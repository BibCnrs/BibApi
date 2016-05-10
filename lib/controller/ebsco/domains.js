import Domain from '../../models/Domain';

export const domains = function* domains() {
    this.body = (yield Domain.find())
    .map(domain => domain.name);
};
