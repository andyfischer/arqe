
import Graph from '../Graph'
import SavedQuery from '../SavedQuery'

it('bumps the changeToken value when there are changes', () => {
    const graph = new Graph();
    const query = graph.savedQuery('tag/*');
    const token = query.changeToken;

    graph.runSilent('set othertag/1');

    expect(query.changeToken).toEqual(token);

    graph.runSilent('set tag/1');

    expect(query.changeToken).not.toEqual(token);
});
