import { crudQueries, selectOneQuery } from 'co-postgres-queries';

const crud = crudQueries('admin_user', ['username', 'password', 'salt'], ['id'], ['id', 'username'], [queries => {
    queries.selectOne.returnFields(['id', 'username']);
    queries.selectPage.returnFields(['id', 'username']);
}]);

export default {
    ...crud,
    selectOneByUsername: selectOneQuery('admin_user', ['username'], ['*'])
};
