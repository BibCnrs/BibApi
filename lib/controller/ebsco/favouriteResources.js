import body from 'co-body';
import { updateFavouriteResources as updateJanusAccountFavouriteResources } from '../../models/JanusAccount';

export function* updateFavouriteResources(id) {
    const { favouriteResources } = yield body(this);
    yield updateJanusAccountFavouriteResources(id, favouriteResources);
    this.body = {
        done: true,
    };
}
