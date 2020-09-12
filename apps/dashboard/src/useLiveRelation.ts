import { useContext, useState, useEffect } from "react";
import { Graph, receiveToRelation, Relation, relationToObject } from 'arqe'
import { graph } from './graph'

let triggersPerSecond = 0;
setInterval(( () => { triggersPerSecond = 0 }), 1000);

function markTrigger() {
    triggersPerSecond++;
    if (triggersPerSecond > 100)
        throw new Error("too many triggers per second");
}


export default function useLiveRelation(queryStr: string) {

    markTrigger();

    const [ liveQuery, setLiveQuery ] = useState(null);
    const [ result, setResult ] = useState(() => new Relation([]));

    useEffect(() => {

        markTrigger();

        if (liveQuery)
            liveQuery.close();

        console.log('creating LiveQuery: ' + queryStr);
        const liveQuery = graph.newLiveQuery(queryStr);

        liveQuery.onChange(() => {
            markTrigger();
            console.log('query has changed: ' + queryStr);
            setResult(liveQuery.runSync());
        });

        setLiveQuery(liveQuery);
        setResult(liveQuery.runSync());

        return () => {
            if (liveQuery)
                liveQuery.close();
        }

    }, [queryStr]);

    return result;
}

export function useLiveRelationList(queryStr: string): null | any[] {
    const rel = useLiveRelation(queryStr);
    console.log('useLiveRelationList saw: ', rel)
    return relationToObject(rel);
}

export function useLiveRelationSingleObject(queryStr: string): null | any[] {
    const rel = useLiveRelation(queryStr);

    if (rel.tuples.length === 0) {
        console.error(`useLiveRelationSingleObject - no values found for ${queryStr}`)
        return {}
    }

    if (rel.tuples.length > 1) {
        console.error(`useLiveRelationSingleObject - multiple values found for ${queryStr}`)
    }

    return rel.tuples[0].toObject();
}
