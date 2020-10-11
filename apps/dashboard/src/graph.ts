
import { Graph } from 'arqe';

function initializeGraph() {
  const graph = new Graph({ context: 'browser' });

  graph.runSync('set sidebar-item((unique)) title() link()');

  graph.runSync('set test-data name(Alice) balance(1.0)');
  graph.runSync('set test-data name(Bob) balance(7.0)');
  graph.runSync('set test-data name(Carter) balance(-1.0)');
  
  graph.runSync('set mini-table name(A) value(A-1)');
  graph.runSync('set mini-table name(B) value(B-1)');

  graph.runSync('set document_item/1 type/query style(table) ');
  graph.runSync('set document_item/1 query(get test-data name balance) ');
  graph.runSync('set document_item/2 type/query style(mini-table) ');
  graph.runSync('set document_item/2 query(get mini-table name value) ');

  graph.runSync('set document_item/3 type/prompt style ');
  graph.runSync('set document_item/3 value(sample value) ');

  graph.runSync('set document_item/4 type/label style');
  graph.runSync('set document_item/4 query(get document_item/3 value)');

  return graph;
}

export const graph = initializeGraph();

export function run(queryStr: string) {
    graph.run(queryStr, {
        next(t) {
            if (t.isCommandError()) {
                console.error(`Error running ${queryStr}: ${t.stringify()}`)
            }
        },
        done() {}
    })
}

function hasWindow() {
    try {
        return !!window;
    } catch (e) {
        return false;
    }
}

if (hasWindow()) {
    window.q = function(str) {
        graph.run(str, {
            next(t) {
                console.log(`> ${t.stringify()}`)
            },
            done() {}
        })
    }
}
