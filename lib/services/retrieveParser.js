'use strict';

import clean from '../utils/clean';

export const extractItemsData = function (items = []) {
    return items
    .filter((item) => item.Name && item.Data)
    .map((item) => {
        return {
            name: item.Name,
            value: clean(item.Data)
        };
    });
};

export default function (result) {
    return [...extractItemsData(result.Items), { name: 'db', value: result.Header ? result.Header.DbLabel: undefined }];
}
