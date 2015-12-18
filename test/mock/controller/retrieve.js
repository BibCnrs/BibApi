'use strict';

import { SearchResult } from './aidsResult.json';
const results = SearchResult.Data.Records;

export default function* retrieve () {
    const { DbId, An } = this.request.body;
    const result = results.find((result) => result.Header.DbId === DbId && result.Header.An === An);

    if(!result) {
        this.status = 400;
        this.body = {
            DetailedErrorDescription: `DbId ${DbId} not available for profile apibvieapi.`,
            ErrorDescription: 'DbId Not In Profile',
            ErrorNumber: '135'
        };
        return;
    }

    this.status = 200;
    this.body = { Record: result };
}
