import useLiveRelation from "./useLiveRelation";
import React from "react";
import { Relation } from 'arqe'
import LargeTableView from "./LargeTableView";
import MiniTableView from "./MiniTableView";

interface Props {
    queryStr: string
    style: string
}

export default function QueryView({ queryStr, style }: Props) {
    const result = useLiveRelation(queryStr);

    if (!result)
        return <div/>

    if (style === "table")
        return <LargeTableView rel={result} />

    if (style === "mini-table")
        return <MiniTableView rel={result} />

    return <div>unrecognized style: {style}</div>
}