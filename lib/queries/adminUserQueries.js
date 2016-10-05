import { crudQueries, selectOneQuery } from 'co-postgres-queries';

const crud = crudQueries('admin_user', ['username', 'password', 'salt', 'comment'], ['id'], ['id', 'username', 'comment'], [queries => {
    queries.selectOne.returnFields(['id', 'username', 'comment']);
    queries.selectPage.returnFields(['id', 'username', 'comment']);
}]);

export default {
    ...crud,
    selectOneByUsername: selectOneQuery('admin_user', ['username'], ['*'])
};
