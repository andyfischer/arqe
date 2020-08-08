import { Graph } from 'arqe';
export function initializeGraph() {
  const graph = new Graph({ context: 'browser' });

  graph.runSync('set sidebar-item((unique)) title(New Query) link(New Query)');

  graph.runSync('set test-data name(Alice) balance(1.0)');
  graph.runSync('set test-data name(Bob) balance(7.0)');
  graph.runSync('set test-data name(Carter) balance(-1.0)');
  
  graph.runSync('set mini-table name(A) value(A-1)');
  graph.runSync('set mini-table name(B) value(B-1)');

  graph.runSync('set document-item style(table) query(get test-data name balance)');
  graph.runSync('set document-item style(mini-table) query(get mini-table name value)');

  return graph;
}
