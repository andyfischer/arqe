import graphContext from "./GraphContext";
import { useContext, useState, useEffect } from "react";
import { Graph, receiveToRelation, Relation, relationToObject } from 'arqe'

export default function useLiveRelation(queryStr: string) {
    const graph: Graph = useContext(graphContext);

    const [ latest, setLatest ] = useState<null | Relation>(null);

    useEffect(() => {

        graph.run(queryStr, receiveToRelation((rel: Relation) => {
            setLatest(rel);
        }));

    }, [graph, queryStr]);

    return latest;
}

export function useLiveRelationList(queryStr: string): null | any[] {
    const rel = useLiveRelation(queryStr);
    if (!rel)
        return null;

    return relationToObject(rel);
}