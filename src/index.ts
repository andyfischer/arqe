
export { default as Graph } from './Graph'
export { default as GraphLike } from './GraphLike'
export { default as Tuple } from './Tuple'
export { default as TupleTag } from './TupleTag'
export { default as Stream } from './Stream'
export { default as runStandardProcess } from './toollib/runStandardProcess'
export { default as startWebApp } from './toollib/startWebApp'
export { rewriteDumpFile } from './DumpFile'
export * from './CommandMeta'
export * from './receiveUtils'
export * from './decorators'
export { default as printConsoleResult } from './console/printResult'
export { parsePattern } from './Pattern'
export { default as Relation } from './Relation'
export { default as relationToObject } from './relationToObject'

if (require.main === module) {
    require('./startServer.js');
}
