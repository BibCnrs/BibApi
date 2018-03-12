import body from 'co-body';

export function* updateFavouriteResources(id) {
    const { favouriteResources } = yield body(this);
    yield this.janusAccountQueries.updateFavouriteResources(id, {
        favourite_resources: JSON.stringify(favouriteResources),
    });
    this.body = {
        done: true,
    };
}
