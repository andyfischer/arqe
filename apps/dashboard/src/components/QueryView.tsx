import React from "react";
import { Relation } from 'arqe'
import LargeTableView from "./LargeTableView";
import MiniTableView from "./MiniTableView";
import useLiveRelation from "../useLiveRelation";

interface Props {
    path: string
    style: string
}

export default function QueryView({ path, style }: Props) {
    // const queryStr = useLiveRelation('get ' + path);
    const result = useLiveRelation(`run-query query ${path}`);

    let content = null;

    if (style === "table")
        content = <LargeTableView rel={result} />

    else if (style === "mini-table")
        content = <MiniTableView rel={result} />

    else
        content = <div>unrecognized QueryView style: {style}</div>

    return <div>
        <div>QueryView</div>
        <div>path = {path}</div>

        { content }
    </div>
}
