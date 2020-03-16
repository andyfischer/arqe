
import { Graph } from 'ik'
import GraphSource from './GraphSource'
import EditModelAPI from './EditModelAPI'

export const graph = new Graph();
graph.loadDump(GraphSource);

const api = new EditModelAPI(graph);

function handleKeyPress(key) {
    const action = api.findActionForKey(key);

    if (action)
        performAction(action);
}

function incRowOrCol(spreadsheet, orig: string, delta: number) {
    const match = /([a-z]+)\/([0-9]+)$/.exec(orig);
    const index = parseInt(match[2]);
    const newId = match[1] + '/' + (index + delta);

    if (api.rowOrColExists(spreadsheet, newId)) {
        return newId;
    } else {
        return orig;
    }
}

function performAction(action) {

    console.log('performAction: ', action)

    const view = api.getCurrentView();
    const deltaStr = api.getMoveActionDelta(action);
    if (deltaStr)
        handleMoveAction(action);

    switch (action) {

    case 'action/start-editing':
        if (api.isEditing(view))
            api.stopEditing(view);
        else
            api.startEditing(view);

        break;

    case 'action/stop-editing':
        api.stopEditing(view);
        break;
    }
}

function handleMoveAction(action) {

    const currentView = api.getCurrentView();
    const spreadsheet = api.spreadsheetForView(currentView);
    const pos = api.getSpreadsheetSelectionPos(currentView);
    const deltaStr = api.getMoveActionDelta(action);

    const delta = {
        x: parseInt(deltaStr.x),
        y: parseInt(deltaStr.y),
    }

    const newPos = {
        row: incRowOrCol(spreadsheet, pos.row, delta.y),
        col: incRowOrCol(spreadsheet, pos.col, delta.x),
    }

    if (pos === newPos)
        return;

    api.clearSelection(currentView);
    api.setSelection(newPos.col, newPos.row, currentView);
}

document.addEventListener('keydown', (evt) => {
    console.log('keydown event: ', evt);
    const key = api.findKeyForBrowserName(evt.key);

    if (key) {
        evt.preventDefault();
        return handleKeyPress(key);
    }
});
