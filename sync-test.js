
const { startFileSyncer } = require('./dist/buildtools/sync-files.js')
const { Graph } = require('.');
const setupNodeStandardTables = require('./dist/setupNodeStandardTables').default;

const graph = new Graph({autoinitMemoryTables: false});

graph.addTables(setupNodeStandardTables())

startFileSyncer(graph, {
  fromBaseDir: 'src',
  glob: '**',
  toBaseDir: 'buildtools/nextjs-dashboard/src/arqe',
  deleteExtraFiles: true
})
.catch(console.error);
