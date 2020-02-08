
export default function collectRespond(onDone) {
    let first = true;
    let sawStart = false;
    let collected = null;
    let sentDone = false;

    return (message) => {

        if (sentDone)
            return;

        if (first && message === '#start') {
            collected = [];
            sawStart = true;
            return;
        }

        first = false;

        if (message === '#done') {
            if (collected === null) {
                onDone('#done');
                sentDone = true;
            } else {
                onDone(collected);
                sentDone = true;
            }
            return;
        }

        if (sawStart) {
            collected.push(message);
        } else {
            onDone(message);
            sentDone = true;
        }
    }
}

interface GraphLike {
    run: (q: string, respond: (response: string) => void) => void
}

export function runSync(graph: GraphLike, q: string)  {
    let result = null;
    const collector = collectRespond(r => { result = r; });
    graph.run(q, collector);

    if (!result)
        throw new Error("query didn't finish synchronously");

    return result;
}
