import { SearchResult } from './rawPublication.json';

const results = SearchResult.Data.Records;

export default function* publicationRetrieve() {
    const { Id } = this.request.body;
    const result = results.find((result) => result.Header.Id === Id);

    if (!result) {
        this.status = 400;
        this.body = {
            DetailedErrorDescription: '',
            ErrorDescription: 'Record not found',
            ErrorNumber: '132',
        };
        return yield Promise.resolve();
    }

    this.status = 200;
    this.body = { Record: result };
}
