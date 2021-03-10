
import QueryContext from "../QueryContext";
import CommandExecutionParams from '../CommandParams'
import { toTuple } from '../coerce'

export default function browseCommand(params: CommandExecutionParams) {
    const { tuple, output, scope } = params;

    for (const mount of scope.graph.tablesById.values()) {

        let match = true;
        for (const tag of tuple.tags)
            if (!mount.matcher.allowedAttrs.has(tag.attr))
                match = false;

        if (!match)
            continue;

        const next = toTuple({
            id: mount.mountId,
            name: mount.name,
            schema: mount.declaredSchema
        });

        output.next(next);
    }

    output.done();
}
