import logger from '../services/logger';

const defaultTo = (defaultValue) => (extractor) => (result) => {
    try {
        return extractor(result) || defaultValue;
    } catch(error) {
        logger.error(error.stack);
        return defaultValue;
    }
};

export default defaultTo;

export const defaultToNull = defaultTo(null);
export const defaultToEmptyArray = defaultTo([]);
