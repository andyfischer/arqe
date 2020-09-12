import React from "react";
import { Relation, TupleTag, Tuple } from 'arqe'
import RelationRenderHelper from "../RelationRenderHelper";
import { styleComponent } from "../reactUtils";

interface Props {
    rel: Relation
}

const HeaderCell = styleComponent('header', { classes: 'top-left-corner top-right-corner' });
const Cell = styleComponent('cell', { classes: 'firstCol lastCol' });

export default function MiniTableView({rel} : Props) {

    const helper = new RelationRenderHelper(rel);

    return <div className="mini-table-grid">

        { helper.headerTags().map(({tag, col, firstCol, lastCol, key}) => 
                <HeaderCell key={key} top-left-corner={firstCol} top-right-corner={lastCol}>
                    { tag.attr }
                </HeaderCell>
        )}

        { helper.bodyTags().map(({tag, row, col, firstCol, key}) => 
            <Cell key={key} firstCol={firstCol} style={{gridRow: row + 1, gridColumn: col}}>
                { tag.value }
            </Cell>
        )}
    </div>
}
