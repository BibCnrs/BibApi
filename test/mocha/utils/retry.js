import co from 'co';
import retry from '../../../lib/utils/retry';

describe('retry', function() {
    it('should call task once with given parameters and return its result', function*() {
        const taskCall = [];
        const task = function* task() {
            yield Promise.resolve();
            taskCall.push([...arguments]);
            return 'task result';
        };

        const onEachError = spy(() => {});
        const onFinalError = spy(() => {});

        const result = yield retry(task, 5, onEachError, onFinalError)(
            'arg1',
            'arg2',
        );
        expect(onEachError).to.not.have.been.called();
        expect(onFinalError).to.not.have.been.called();

        assert.equal(result, 'task result');
        assert.deepEqual(taskCall, [['arg1', 'arg2']]);
    });

    it('should retry given task if it throw a retry error x time then throw giving up error', function*() {
        const taskCall = [];
        const task = function* task() {
            taskCall.push([...arguments]);
            yield Promise.resolve();
            throw new Error('retry');
        };

        const onEachError = spy(async () => {});
        const onFinalError = spy(async () => {});

        const error = yield co(retry(task, 5, onEachError, onFinalError)('arg'))
            .then(() => 'no error')
            .catch(error => error.message);

        expect(onEachError).to.have.been.called.exactly(5);
        expect(onFinalError).to.have.been.called.once();

        assert.equal(error, 'Max retry reached. Giving up.');
        assert.deepEqual(taskCall, [
            ['arg'],
            ['arg'],
            ['arg'],
            ['arg'],
            ['arg'],
        ]);
    });

    it('should retry given task while it return a retry error', function*() {
        const taskCall = [];
        const task = function* task() {
            taskCall.push([...arguments]);
            yield Promise.resolve();

            if (taskCall.length < 3) {
                throw new Error('retry');
            }

            return 'task result';
        };

        const onEachError = spy(async () => {});
        const onFinalError = spy(async () => {});

        const result = yield retry(task, 5, onEachError, onFinalError)('arg');

        expect(onEachError).to.have.been.called.exactly(2);
        expect(onFinalError).to.not.have.been.called();

        assert.equal(result, 'task result');
        assert.deepEqual(taskCall, [['arg'], ['arg'], ['arg']]);
    });

    it('should call task once throwing its error if it is not retry', function*() {
        const taskCall = [];
        const task = function* task() {
            yield Promise.resolve();
            taskCall.push([...arguments]);
            throw new Error('boom');
        };

        const onEachError = spy(async () => {});
        const onFinalError = spy(async () => {});

        const error = yield co(retry(task, 5, onEachError, onFinalError)('arg'))
            .then(() => 'no error')
            .catch(error => error.message);

        expect(onEachError).to.have.been.called.exactly(1);
        expect(onFinalError).to.have.been.called.exactly(1);

        assert.equal(error, 'boom');
        assert.deepEqual(taskCall, [['arg']]);
    });
});
