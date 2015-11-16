'use strict';

import cleanXml from './cleanXml';

export const extractItemsData = function (items = []) {
    return items
    .reduce((result, item) => {
        if (!item.Name || !item.Data) {
            return result;
        }
        return {
            ...result,
            [item.Name]: cleanXml(item.Data)
        };
    }, {});
};

export default function (result) {
    return {
        db: result.Header ? result.Header.DbLabel: undefined,
        ...extractItemsData(result.Items)
    };
}
