const delay = ms => new Promise(resolve => setTimeout(() => resolve(true), ms));

const getRetryLoop = (task, args, onError) =>
    function* retryLoop(max) {
        if (max === 0) {
            throw new Error('Max retry reached. Giving up.');
        }
        try {
            return yield task(...args);
        } catch (error) {
            yield onError(error);
            if (error.message === 'retry') {
                yield delay(100);
                return yield retryLoop(max - 1);
            }
            throw error;
        }
    };

export default (task, max, onEachError, onFinalError) =>
    function* retry(...args) {
        try {
            const retryLoop = getRetryLoop(task, args, onEachError);
            return yield retryLoop(max);
        } catch (error) {
            yield onFinalError(error);
            throw error;
        }
    };
