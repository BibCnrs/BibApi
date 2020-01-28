import koa from 'koa';
import route from 'koa-route';

const rewritingUrl = function*(next) {
    if (
        !this.query ||
        (!this.query.url && !this.query.sid && !this.query.domaine)
    ) {
        yield next;
        return;
    }
    this.body = { url: this.query.url };
};

const app = koa();
app.use(route.get('/', rewritingUrl));

export default app;
