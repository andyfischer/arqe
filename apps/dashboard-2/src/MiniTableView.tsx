import React from "react";
import { Relation, TupleTag, Tuple } from 'arqe'
import styled from "styled-components";
import RelationRenderHelper from "./RelationRenderHelper";
import { withClassname } from "./reactUtils";

interface Props {
    rel: Relation
}

const GridStyle = styled.div<{rowCount: number, columnCount: number}>`
    display: inline-grid;
    grid-template-columns: repeat(${props => props.columnCount}, auto);
    grid-template-rows: repeat(${props => props.rowCount}, auto);

    .header {
        background: white;
        color: black;
        padding: 5px;
    }

    .top-left-corner {
        background: white;
        border-radius: 15px 0 0 0;
        padding-left: 10px;
        padding-right: 10px;
    }

    .top-right-corner {
        background: white;
        border-radius: 0 15px 0 0;
        padding-left: 10px;
        padding-right: 10px;
    }

    .cell {
        display: flex;
        justify-content: center;

        padding: 5px;
        padding-bottom: 6px;
        margin-bottom: -1px;

        border: 1px solid #ddd;

        &:not(.firstCol) {
            padding-left: 6px;
            margin-left: -1px;
        }
    }
`

const HeaderCell = withClassname('div', 'header', {mayHave: 'top-left-corner top-right-corner'});
const Cell = withClassname('div', 'cell', {mayHave: 'firstCol lastCol'});

export default function MiniTableView({rel} : Props) {

    const helper = new RelationRenderHelper(rel);

    return <GridStyle
        rowCount={helper.rowCount()}
        columnCount={helper.columnCount()}>

        { helper.headerTags().map(({tag, col, firstCol, lastCol, key}) => 
                <HeaderCell top-left-corner={firstCol} top-right-corner={lastCol}>
                    { tag.attr }
                </HeaderCell>
        )}

        { helper.bodyTags().map(({tag, row, col, firstCol}) => 
            <Cell firstCol={firstCol} style={{gridRow: row + 1, gridColumn: col}}>
                { tag.value }
            </Cell>
        )}
    </GridStyle>
}