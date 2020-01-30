
import Command from './Command'
import Graph from './Graph'

export default function saveRelation(graph: Graph, command: Command) {
    return graph.inMemory.save(command);
}
