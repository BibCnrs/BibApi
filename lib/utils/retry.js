const delay = ms => new Promise(resolve => setTimeout(() => resolve(true), ms));

function* retryLoop(task, args, max) {
    if (max === 0) {
        throw new Error('Max retry reached. Giving up.');
    }
    try {
        return yield task(...args);
    } catch (error) {
        if (error.message === 'retry') {
            yield delay(100);
            return yield retryLoop(task, args, max - 1);
        }
        throw error;
    }
}

export default (task, max) =>
    function* retry(...args) {
        return yield retryLoop(task, args, max);
    };
