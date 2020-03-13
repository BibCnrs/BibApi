import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';

import InistAccount from '../../models/InistAccount';
import postgresCrud from '../../utils/postgresCrud';

/**
 * used for export data
 */
export const get = function*(next) {
    if (!this.query || this.query._perPage != 100000) {
        yield next;
        return;
    }
    const inistAccountQueries = InistAccount(this.postgres);
    this.body = yield inistAccountQueries.selectAllForExport();

    const totalCount = this.body.length;
    this.set('Content-Range', totalCount);
    this.set('Access-Control-Expose-Headers', 'Content-Range');
};

const app = koa();

app.use(route.get('/', get));
app.use(mount('/', postgresCrud(InistAccount)));

export default app;
