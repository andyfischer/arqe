
import { Graph } from 'ik'
import GraphSource from './GraphSource'
import EditModelAPI from './EditModelAPI'

export const graph = new Graph();
graph.loadDump(GraphSource);

const api = new EditModelAPI(graph);

function handleKeyPress(key) {
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

    case 'action/toggle-editing':
        if (api.isEditing(view)) {
            api.stopEditing(view);
            // FIXME - These args are in the wrong order
            //   Need a way to specify the ordering in db
            //   Need a way to validate inputs

            api.setInputMode(view, 'normal');
        } else {
            console.log('start mode: text-editing');
            api.startEditing(view);
            api.setInputMode(view, 'text-editing');
        }

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
    const view = api.getCurrentView();
    console.log('keydown event: ', evt);
    const key = api.findKeyForBrowserName(evt.key);

    console.log('current mode: ', api.getInputMode(view))
    console.log('action for key in mode: ', api.findActionForKeyInMode(key, view));

    if (!key)
        return;

    evt.preventDefault();

    const action = api.findActionForKey(key);
    if (action)
        performAction(action);

});
