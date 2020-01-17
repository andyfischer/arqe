
import Graph from './Graph'
import Scope from './Scope'

export default function scopeFromObject(object: { [key: string]: any }) {
    const graph = new Graph();
    const scope = new Scope(graph);
    for (const key in object) {
        scope.createSlot(key);
        scope.set(key, object[key]);
    }
    return scope;
}
