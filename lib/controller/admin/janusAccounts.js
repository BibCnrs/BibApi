import koa from 'koa';
import mount from 'koa-mount';
import route from 'koa-route';

import JanusAccount from '../../models/JanusAccount';
import postgresCrud from '../../utils/postgresCrud';

export const get = function* (next) {
    if(!this.query || !this.query.export) {
        yield next;
        return;
    }
    const janusAccountQueries = JanusAccount(this.postgres);

    this.body = yield janusAccountQueries.selectAllForExport();
};


const app = koa();

app.use(route.get('/', get));
app.use(mount('/', postgresCrud(JanusAccount)));

export default app;
