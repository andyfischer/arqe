
export { default as Graph } from './Graph'
export { default as GraphLike } from './GraphLike'
export { default as Relation } from './Relation'
export { default as RelationReceiver } from './RelationReceiver'
export { default as Pattern } from './Pattern'
export { default as receiveToRelationList } from './Relation'
export { default as runStandardProcess } from './toollib/runStandardProcess'
export { default as startWebApp } from './toollib/startWebApp'
export { default as StorageProvider } from './StorageProvider'
export { default as loadGraphFromLocalDatabase } from './loadGraphFromLocalDatabase'
export { rewriteDumpFile } from './DumpFile'
export * from './CommandMeta'
export * from './receiveUtils'
export { default as printConsoleResult } from './console/printResult'

if (require.main === module) {
    require('./startServer.js');
}
