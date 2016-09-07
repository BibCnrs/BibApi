import co from 'co';
import retry from '../../../lib/utils/retry';

describe.only('retry', function () {

    it('should call task once with given parameters and return its result', function* () {
        const taskCall = [];
        const task = function* task() {
            yield Promise.resolve();
            taskCall.push([...arguments]);
            return 'task result';
        };

        const result = yield retry(task, ['arg1', 'arg2'], 5);

        assert.equal(result, 'task result');
        assert.deepEqual(taskCall, [
            ['arg1', 'arg2']
        ]);
    });

    it('should retry given task if it throw a retry error x time then throw giviing up error', function* () {
        const taskCall = [];
        const task = function* task() {
            taskCall.push([...arguments]);
            yield Promise.resolve();
            throw new Error('retry');
        };

        const error = yield co(retry(task, ['arg'], 5))
        .then(() => 'no error')
        .catch(error => error.message);

        assert.equal(error, 'Max retry reached. Giving up.');
        assert.deepEqual(taskCall, [
            ['arg'],
            ['arg'],
            ['arg'],
            ['arg'],
            ['arg']
        ]);
    });

    it('should retry given task while it return a retry error', function* () {
        const taskCall = [];
        const task = function* task() {
            taskCall.push([...arguments]);
            yield Promise.resolve();

            if(taskCall.length < 3) {
                throw new Error('retry');
            }

            return 'task result';
        };

        const result = yield retry(task, ['arg'], 5);

        assert.equal(result, 'task result');
        assert.deepEqual(taskCall, [
            ['arg'],
            ['arg'],
            ['arg']
        ]);
    });

    it('should call task once throwing its error if it is not retry', function* () {
        const taskCall = [];
        const task = function* task() {
            yield Promise.resolve();
            taskCall.push([...arguments]);
            throw new Error('boom');
        };

        const error = yield co(retry(task, ['arg'], 5))
        .then(() => 'no error')
        .catch(error => error.message);

        assert.equal(error, 'boom');
        assert.deepEqual(taskCall, [
            ['arg']
        ]);
    });
});
