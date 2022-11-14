const delay = (ms) =>
    new Promise((resolve) => setTimeout(() => resolve(true), ms));

const getRetryLoop = (task, args) =>
    function* retryLoop(max) {
        if (max === 0) {
            throw new Error('Max retry reached. Giving up.');
        }
        try {
            return yield task(...args);
        } catch (error) {
            if (error.message === 'retry') {
                yield delay(100);
                return yield retryLoop(max - 1);
            }
            throw error;
        }
    };

export default (task, max) =>
    function* retry(...args) {
        const retryLoop = getRetryLoop(task, args);
        return yield retryLoop(max);
    };
