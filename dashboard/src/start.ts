
import { Graph } from 'ik'
import GraphSource from './generated/GraphSource'
import EditModelAPI from './generated/EditModelAPI'

export const graph = new Graph();
graph.loadDump(GraphSource);

const api = new EditModelAPI(graph);

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

    const view = api.getCurrentView();
    const deltaStr = api.getMoveActionDelta(action);
    if (deltaStr)
        handleMoveAction(action);

    switch (action) {

    case 'action/start-editing':
        api.startEditing(view);
        api.setInputMode(view, 'input-mode/text-editing');
        break;

    case 'action/stop-editing':
        api.stopEditing(view);
        api.setInputMode(view, 'input-mode/normal');
        break;

    case 'action/toggle-editing':
        if (api.isEditing(view)) {
            api.stopEditing(view);
            api.setInputMode(view, 'input-mode/normal');
        } else {
            api.startEditing(view);
            api.setInputMode(view, 'input-mode/text-editing');
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
    api.setSelection(currentView, newPos.col, newPos.row);
}

function onKeyDown(evt) {
    const view = api.getCurrentView();
    const key = api.findKeyForBrowserName(evt.key);

    if (!key)
        return;

    const inputMode = api.getInputMode(view);
    let defaultAction = api.findActionForKey(key);
    const modeAction = api.findActionForKeyInMode(view, key);

    if (inputMode === 'input-mode/text-editing' && !modeAction)
        return;

    const action = modeAction || defaultAction;

    evt.preventDefault();
    if (action)
        performAction(action);

}

document.addEventListener('keydown', onKeyDown);

window['query'] = (s) => {
    graph.runCommandChainSync(s).map(r => console.log(r.stringifyRelation()));
}
