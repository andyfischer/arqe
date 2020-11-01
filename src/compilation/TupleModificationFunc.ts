
import Tuple from '../Tuple'
import Relation from '../Relation'
import Stream from '../Stream'

export function compileTupleModificationFunc(rel: Relation): (t: Tuple) => Tuple {

    return rel.usingCache('tupleModification', rel => {
        const body = [];

        for (const t of rel.body()) {
            if (t.has('remove-attr')) {
                body.push(`t = t.removeAttr("${t.get('remove-attr')}")`);
            }
        }

        const f = new Function('t', `
            ${body.join(';\n')}
            return t;
        `);

        return f as (t:Tuple) => Tuple;
    });
}

export function compileTupleModificationStream(rel: Relation, out: Stream) {
    return {
        next: (t: Tuple) => {
            const func = compileTupleModificationFunc(rel);
            const modified = func(t);
            out.next(modified);
        },
        done() {
            out.done();
        }
    }
}
