
import Graph from '../../Graph'
import ParsedQuery from '../../ParsedQuery'
import CompoundQuery from '../../CompoundQuery'
import { newTag } from '../../TupleTag'
import { appendTagInCommand } from '../../stringifyQuery'

export interface ChaosMode {
    name: string
    shortDescription: string
    setupNewGraph?: (graph: Graph) => void
    modifyRunCommand?: (command: string) => string
}

// Modes to add:
//  - Enable specific optimizations

export function activeChaosModes() {
    return []

}
