import historyQueries from '../queries/historyQueries';

function History(client) {
    const historyClient = client.link(History.queries);

    return historyClient;
}

History.queries = historyQueries;

export default History;
