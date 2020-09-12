
import { Relation, TupleTag, Tuple } from 'arqe'
import React from 'react'
import { styleComponent } from '../reactUtils'
import RelationRenderHelper from '../RelationRenderHelper'

interface Props {
    rel: Relation
}

const Cell = styleComponent('cell', { classes: 'first-col' })
const LargeTableGrid = styleComponent('large-table-grid', { vars: 'columnCount rowCount' });

export default function TableQueryView({rel}: Props) {
    const header = rel.getOrInferHeader();
    const rows = rel.tuples;
    const attrToIndex = header.getAttrToIndexMap();
    const helper = new RelationRenderHelper(rel);

    return <LargeTableGrid columnCount={helper.columnCount()} rowCount={helper.rowCount()}>
        { header.tags.map((tag: TupleTag, i) => {
            return <div className="header" style={{'--columns': i+1, '--rows': 1}} key={'header-' + i}>
                { tag.attr }
            </div>
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

    </LargeTableGrid>
}
