import coBody from 'co-body';
import koa from 'koa';
import koaRoute from 'koa-route';

function getListParams(query) {
    const filter = query.filter ? JSON.parse(query.filter) : {};

    const page = query._page || 1;
    const perPage = query._page || 30;

    const last = page * perPage;
    const first = last - perPage;

    return {
        first,
        last,
        sortField: query._sortField || '_id',
        sortDir: query._sortDir || 'asc',
        filter
    };
}


/**
    model: mongoose model
    fields: name of selectable fields (eg.: ['name'])
    options:
        - onlyMethods: restrict methods for route generator (eg.: ['get', 'post', 'put'])
        - filterFields: name of field names to be be usable in query filters (eg.: ['name'])
*/
export default function crud(model, idField = '_id', fields = [], options = {}, app = koa()) {
    if (!fields || fields.length === 0) {
        throw new Error('You must specified fields to configure crud');
    }

    const onlyMethods = options.onlyMethods || [];
    const filterFields = options.filterFields || [];
    const notFoundError = new Error('Not Found');
    notFoundError.status = 404;

    if (!onlyMethods.length || onlyMethods.indexOf('get') !== -1) {
        app.use(koaRoute.get('/', function* all() {
            const { first, last, sortField, sortDir, filter } = getListParams(this.query);
            const query = {};
            for (const name in filter) { // eslint-disable-line guard-for-in
                let realName = name;
                let type = 'string';
                if (name.substr(-2) === '[]') {
                    realName = name.replace('[]', '');
                    type = 'array';
                }
                if (filterFields.indexOf(realName) === -1) {
                    continue;
                }
                let filterValue = filter[name];
                if (type === 'array') {
                    query[realName] = { $in: filterValue };
                    continue;
                }
                const matches = /^#(.*)$/.exec(filterValue);
                if (matches) {
                    filterValue = new RegExp(matches[1], 'i');
                }
                query[realName] = filterValue;
            }

            const [nbItems, items] = yield [
                model.count(query),
                model.find(query)
                    .select(fields.join(' '))
                    .sort((sortDir.toLowerCase() === 'asc' ? '' : '-') + sortField)
                    .skip(first)
                    .limit(last - first + 1)
            ];

            this.body = items;
            this.response.set('X-Total-Count', nbItems);
            this.response.set('Access-Control-Expose-Headers', 'x-total-count');
        }));

        app.use(koaRoute.get('/:id', function* one(id) {
            this.body = yield model.findOne({ [idField]: id }, fields.join(' '));
        }));
    }

    if (!onlyMethods.length || onlyMethods.indexOf('post') !== -1) {
        app.use(koaRoute.post('/', function* create() {
            this.data = this.data || (yield coBody(this));
            try {
                this.body = yield model.create(this.data);
            } catch (error) {
                error.status = 400;
                error.message = 'The data given in the POST or PUT failed validation';

                throw error;
            }
        }));
    }

    if (!onlyMethods.length || onlyMethods.indexOf('delete') !== -1) {
        app.use(koaRoute['delete']('/:id', function* del(id) { // eslint-disable-line dot-notation
            this.body = yield model.findOneAndRemove({ [idField]: id });
        }));
    }

    if (!onlyMethods.length || onlyMethods.indexOf('put') !== -1) {
        app.use(koaRoute.put('/:id', function* update(id) {
            this.data = yield coBody(this);

            this.body = yield model.findOneAndUpdate({ [idField]: id }, this.data, { new: true });
        }));
    }

    return app;
}
