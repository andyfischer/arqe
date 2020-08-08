
import { Relation, TupleTag, Tuple } from 'arqe'
import styled from 'styled-components'
import React from 'react'
import { withClassname } from './reactUtils'
import RelationRenderHelper from './RelationRenderHelper'

interface Props {
    rel: Relation
}

const GridStyle = styled.div<{rowCount: number, columnCount: number}>`
    display: grid;
    grid-template-columns: repeat(${props => props.columnCount}, 1fr);
    grid-template-rows: repeat(${props => props.rowCount}, 1fr);

    .cell {
        padding: 10px;
        padding-right: 11px;
        margin-right: -1px;
        padding-bottom: 11px;
        margin-bottom: -1px;

        border: 1px solid #ddd;
    }
`;

const Cell = withClassname('div', 'cell', { mayHave: 'first-col' })

const CellHeaderContent = styled.div`
    font-style: italic;
`

export default function TableQueryView({rel}: Props) {
    const header = rel.getOrInferHeader();
    const rows = rel.tuples;
    const attrToIndex = header.getAttrToIndexMap();
    const helper = new RelationRenderHelper(rel);

    return <GridStyle columnCount={helper.columnCount()} rowCount={helper.rowCount()}>
        { header.tags.map((tag: TupleTag, i) => {
            return <Cell
                style={{gridColumn: i+1, gridRow: 1}}
                key={'header-' + i}>
                <CellHeaderContent>
                    { tag.attr }
                </CellHeaderContent>
            </Cell>
        }) }

        { rel.tuples.map((tuple: Tuple, tupleIndex: number) => {

            let nextOverflowCol = 0;

            return tuple.tags.map((tag: TupleTag, tagIndex: number) => {
                
                const row = 1 + tupleIndex;
                let matchesHeader = false;
                let col;

                if (tag.attr && attrToIndex.has(tag.attr)) {
                    col = attrToIndex.get(tag.attr);
                    matchesHeader = true
                } else {
                    col = header.tags.length + nextOverflowCol;
                    nextOverflowCol += 1;
                }

                if (matchesHeader && !tag.hasValue())
                    return null;

                return <Cell
                    first-col={col == 0}
                    style={{
                        gridColumn: col + 1,
                        gridRow: row + 1,
                    }}
                    key={`cell-${row}-${col}`}>
                    { matchesHeader ? tag.valueToString() : tag.stringify() }
                </Cell>
            });
        })}

    </GridStyle>
}
