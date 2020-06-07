
type LookupStep = Map<string, true | LookupStep>

interface Node<Val> {
    following?: Map<string, Node<Val>>
    terminates?: Val
}

export default class SubsetLookup<Val> {

    topNode: Node<Val> = {}

    set(els: string[], value: Val) {
        els.sort();

        let node = this.topNode;

        for (const el of els) {

            if (!node.following)
                node.following = new Map();

            if (!node.following.has(el))
                node.following.set(el, {});

            node = node.following.get(el);
        }

        node.terminates = value;
    }

    lookupExact(els: string[]): Val | null {
        els.sort();

        let node = this.topNode;

        for (const el of els) {
            if (!node.following)
                return null;

            if (!node.following.has(el))
                return null;

            node = node.following.get(el);
        }

        return (node.terminates === undefined ? node.terminates : null);
    }
}
