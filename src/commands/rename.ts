
import QueryContext from '../QueryContext'
import CommandParams from '../CommandParams'
import { emitCommandError } from '../CommandMeta'
import Tuple from '../Tuple'

export default function runQueryCommand(cxt: QueryContext, params: CommandParams) {

    const { tuple, input, output } = params;

    if (!tuple.hasAttr("from")) {
        emitCommandError(output, "missing required field: from");
        output.done();
        return;
    }

    if (!tuple.hasAttr("to")) {
        emitCommandError(output, "missing required field: to");
        output.done();
        return;
    }

    const from = tuple.getVal("from");
    const to = tuple.getVal("to");

    input.sendTo({
        next(t: Tuple) {
            const tag = t.getTagObject(from);
            if (!tag) {
                output.next(t)
                return;
            }
            t = t.removeAttr(from).addTag(tag.setAttr(to));
            output.next(t);
        },
        done() {
            output.done()
        }
    })
}
