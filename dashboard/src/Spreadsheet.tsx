
// goals:
//   take input data about rows & columns & cells
//   render grid
//   adjust sizes based on item contents
//   cell selection
//   change selection with arrows
//   start editing a cell
//   press enter to finish editing a cell
//   click and drag cell edges

// SpreadsheetView
// SpreadsheetState
//   as Graph

// Data model
// 
//   col/x
//   col/x width
//   col/x name
//   row/x
//   row/x height
//   spreadsheet
//   spreadsheet row/*
//   spreadsheet col/*
//   row/x col/x cell

//   spreadsheet cursor row/x col/x
//   spreadsheet edit-state/editing

import React from 'react'
import SpreadsheetViewAPI from './SpreadsheetViewAPI'
import { Graph } from 'ik'

interface Props {
    graph: Graph
    spreadsheetView: string
}

export default function Spreadsheet(props: Props) {

    const { graph, spreadsheetView } = props;

    const api = new SpreadsheetViewAPI(graph);
    const spreadsheet = api.spreadsheetForView(spreadsheetView);

    const cols = api.listColumns(spreadsheet);
    const rows = api.listRows(spreadsheet);
    const selection = api.getSelectedCell(spreadsheetView);

    let gridTemplateColumns = '';

    for (const col of cols) {
        gridTemplateColumns += '1fr ';
    }

    for (const row of api.listRows(spreadsheet)) {
    }

    return <div>
        <style>{`
            .grid-element {
              padding: 2px;
            }
            .grid-element.selected {
              background-color: #77EAFF;
            }
            .header-element {
                color: #666;
            }
        `}</style>
        <p>Looking at spreadsheet view: {spreadsheetView}</p>
        <p>Looking at spreadsheet: {spreadsheet}</p>
        <p>Selection: {JSON.stringify(selection)}</p>
        <p>Cols: {cols.join(' ')}</p>
        <p>Rows: {rows.join(' ')}</p>
        <div style={{
            display: 'grid',
            gridGap: '6px',
            gridTemplateColumns,
            width: '50%'
        }} >

        { cols.map(col => {
            return <div className="grid-element header-element" key={col} style={{
                }}>
                {api.colName(col)}
            </div>
        })}


        { rows.map(row => {
            return cols.map(col => {

                const value = api.getCellValue(col, row) || '';
                const isSelected = selection
                    && (col === selection.col)
                    && (row === selection.row);

                const className = 'grid-element' + (isSelected ? ' selected' : '');

                return <div className={className} key={row + ' ' + col} >
                    {value}
                </div>
            })
        })}

        </div>
    </div>
}
