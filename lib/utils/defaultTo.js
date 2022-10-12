const defaultTo = (defaultValue) => (extractor) => (result) => {
    try {
        return extractor(result) || defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

export default defaultTo;

export const defaultToNull = defaultTo(null);
export const defaultToEmptyArray = defaultTo([]);
export const defaultToEmptyObject = defaultTo({});
