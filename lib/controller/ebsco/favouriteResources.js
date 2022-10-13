import body from 'co-body';
import { updateFavouriteResources as updateJanusAccountFavouriteResources } from '../../models/JanusAccount';

export function* updateFavouriteResources(id) {
    const { favouriteResources } = yield body(this);
    yield updateJanusAccountFavouriteResources(id, {
        favourite_resources: JSON.stringify(favouriteResources),
    });
    this.body = {
        done: true,
    };
}
