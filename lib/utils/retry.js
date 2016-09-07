export default function* retry(task, args, max = 5) {
    if(max === 0) {
        throw new Error('Max retry reached. Giving up.');
    }
    try  {
        return yield task(...args);
    } catch(error) {
        if(error.message === 'retry') {
            return yield retry(task, args, max - 1);
        }
        throw error;
    }
}
