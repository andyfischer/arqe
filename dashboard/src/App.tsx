import React from 'react';
import { Graph } from 'ik'
import Spreadsheet from './Spreadsheet'
import GraphSource from './GraphSource'
import './App.css';
import useEventListener from './useEventListener'
import EditModelAPI from './EditModelAPI'

const graph = new Graph();
graph.loadDump(GraphSource);

const api = new EditModelAPI(graph);

function handleKeyPress(key) {
    const action = api.findActionForKey(key);

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
    const currentView = api.getCurrentView();
    const spreadsheet = api.spreadsheetForView(currentView);
    const pos = api.getSpreadsheetSelectionPos(currentView);
    const deltaStr = api.getMoveActionDelta(action);

    if (!deltaStr)
        return;

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

    console.log('new pos = ', newPos)

    console.log('nothing to do for action: ' + action);
}

const App: React.FC = () => {
  const handleKey = useEventListener('keydown', (evt) => {
      console.log("event: ", evt);
      const key = api.findKeyForBrowserName(evt.key);
      if (key)
          handleKeyPress(key);
  });

  return (
    <div className="App">
      <Spreadsheet graph={graph} spreadsheetView="spreadsheet-view/1" />
    </div>
  );
}

export default App;
