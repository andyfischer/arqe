
import Graph from '../Graph'
import Tuple from '../Tuple'
import { emitTupleDeleted } from '../CommandMeta'
import CommandParams from '../CommandParams'
import getCommand from './get'
import QueryContext from '../QueryContext'

export default function runListen(cxt: QueryContext, params: CommandParams) {

    const { tuple, flags, output } = params;

    if (flags.get) {
        getCommand(cxt, tuple, {
            next(rel) {
                if (!rel.isCommandMeta())
                    output.next(rel)
            },
            done() {}
        });
    }

    cxt.graph.addListener(tuple, {
        onTupleUpdated(rel: Tuple) {
            output.next(rel);
        },
        onTupleDeleted(rel: Tuple) {
            emitTupleDeleted(rel, output);
        }
    });
}
