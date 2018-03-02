import aidsResult from './aidsResult.json';

export default function* search() {
    if (this.request.body.SearchCriteria.Queries[0].Term !== 'aids') {
        this.status = 200;
        this.body = {
            SearchResult: {
                Statistics: {
                    TotalHits: 0,
                },
            },
        };
        return yield Promise.resolve();
    }
    this.status = 200;
    this.body = aidsResult;
}
