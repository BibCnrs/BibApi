import co from 'co';

export default function (schema, modelAttr, LinkedModel, linkedAttr) {
    const modelIdToAttr = function* (entity) {
        if (!entity) {
            return;
        }
        const model = yield LinkedModel.findById(entity[modelAttr]);

        if (!model) {
            return;
        }

        entity[modelAttr] = model[linkedAttr];
    };

    const postFindHook = function (entities, next) {
        entities = [].concat(entities);
        co(function* () {
            yield entities.map(modelIdToAttr);
            next();
        }).catch((error) => next(error));
    };

    const findByLinkedAttr = function* (value) {
        if (!value) {
            return undefined;
        }
        const linkedModel = yield LinkedModel.findOne({
            [linkedAttr]: value,
        });
        if (!linkedModel) {
            const error = new Error(
                `${LinkedModel.modelName} { ${linkedAttr}: ${value} } does not exists`,
            );
            error.status = 500;
            throw error;
        }

        return linkedModel;
    };

    schema.pre('save', function (next) {
        let entity = this;
        co(function* () {
            const model = yield findByLinkedAttr(entity[modelAttr]);
            if (model) {
                entity[modelAttr] = model._id;
            }

            return next();
        }).catch(next);
    });

    schema.pre('findOneAndUpdate', function (next) {
        let query = this;
        co(function* () {
            if (query._update[modelAttr]) {
                const model = yield findByLinkedAttr(query._update[modelAttr]);

                query._update[modelAttr] = model._id;
            }
            return next();
        }).catch(next);
    });

    schema.post('find', postFindHook);
    schema.post('findOne', postFindHook);
    schema.post('findOneAndUpdate', postFindHook);
    schema.post('save', postFindHook);
}
