import co from 'co';

export default function (schema, modelAttr, LinkedModel, linkedAttr) {
    const modelIdToAttr = function* (entity) {
        if (!entity || !entity[modelAttr]) {
            return;
        }
        const models = yield entity[modelAttr].map((id) =>
            LinkedModel.findById(id),
        );

        entity[modelAttr] = models.map((model) => model[linkedAttr]);
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
            if (!entity[modelAttr]) {
                return next();
            }
            const models = yield entity[modelAttr]
                .map((value) => {
                    return findByLinkedAttr(value);
                })
                .filter((value) => !!value);

            entity[modelAttr] = models
                .filter((model) => !!model)
                .map((model) => model._id);

            return next();
        }).catch(next);
    });

    schema.pre('findOneAndUpdate', function (next) {
        let query = this;
        co(function* () {
            if (query._update.$set && query._update.$set[modelAttr]) {
                return next();
            }
            if (query._update[modelAttr]) {
                const models = yield query._update[modelAttr]
                    .map((value) => findByLinkedAttr(value))
                    .filter((value) => !!value);

                query._update[modelAttr] = models
                    .filter((model) => !!model)
                    .map((model) => model._id);
            }
            return next();
        }).catch(next);
    });

    schema.post('find', postFindHook);
    schema.post('findOne', postFindHook);
    schema.post('findOneAndUpdate', postFindHook);
    schema.post('save', postFindHook);
}
