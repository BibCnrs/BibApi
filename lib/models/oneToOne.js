import co from 'co';

export default function (schema, modelAttr, LinkedModel, linkedAttr) {

    const modelIdToName = function* (entity) {
        if (!entity) {
            return;
        }
        const model = yield LinkedModel.findById(entity[modelAttr]);

        if (!model) {
            return;
        }

        entity[modelAttr] = model[linkedAttr];
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
            const model = yield LinkedModel.findOne({ [linkedAttr]: entity[modelAttr] });
            if(model) {
                entity[modelAttr] = model._id;
            }

            return next();
        })
        .catch(next);
    });

    schema.pre('findOneAndUpdate', function (next) {
        let query = this;
        co(function* () {
            if (query._update[modelAttr]) {
                const model = yield LinkedModel.findOne({ [linkedAttr]: query._update[modelAttr] });

                query._update[modelAttr] = model._id;
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
