
export { default as Graph } from './Graph'
export { default as GraphLike } from './GraphLike'
export { default as Relation } from './Relation'
export { default as receiveToRelationList } from './Relation'
export * from './receivers'

if (require.main === module) {
    require('./startServer.js');
}
