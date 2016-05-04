import co from 'co';

export default function (schema, modelAttr, LinkedModel) {

    const modelIdToName = function* (entity) {
        if (!entity) {
            return;
        }
        const models = yield entity[modelAttr].map(model => LinkedModel.findById(model));

        entity[modelAttr] = models.map(model => model.name);
    };

    const postFindHook = function (entities, next)  {
        entities = [].concat(entities);
        co(function* () {
            yield entities.map(modelIdToName);
            next();
        })
        .catch(error => next(error));
    };

    schema.pre('save', function (next) {
        let entity = this;
        co(function* () {
            const models = yield entity[modelAttr]
            .map(name => LinkedModel.findByName(name));

            entity[modelAttr] = models
            .filter(model => !!model)
            .map(model => model._id);

            return next();
        })
        .catch(next);
    });

    schema.pre('findOneAndUpdate', function (next) {
        let query = this;
        co(function* () {
            if (query._update[modelAttr]) {
                const models = yield query._update[modelAttr]
                .map(name => LinkedModel.findByName(name));

                query._update[modelAttr] = models
                .filter(model => !!model)
                .map(model => model._id);
            }
            return next();
        })
        .catch(next);
    });

    schema.post('find', postFindHook);
    schema.post('findOne', postFindHook);
    schema.post('findOneAndUpdate', postFindHook);
    schema.post('save', postFindHook);
}
