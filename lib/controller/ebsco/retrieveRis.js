import request from 'request-promise';
import coBody from 'co-body';

export function* retrieveRis() {
    const { links } = yield coBody(this);
    this.body = yield links.map(request);
}
