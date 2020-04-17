
export { default as Graph } from './Graph'
export { default as GraphLike } from './GraphLike'
export { default as Relation } from './Relation'

if (require.main === module) {
    require('./startServer.js');
}
