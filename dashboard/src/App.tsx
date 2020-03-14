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

function incRowColId(item: string, delta: number) {
    const match = /([a-z]+)\/([0-9]+)$/.exec(item);
    const index = parseInt(match[2]);
    return match[1] + '/' + (index + delta);
}

function performAction(action) {
    const currentView = api.getCurrentView();
    // const spreadsheet = api.spreadsheetForView(currentView);
    const pos = api.getSpreadsheetSelectionPos(currentView);
    const deltaStr = api.getMoveActionDelta(action);
    const delta = {
        x: parseInt(deltaStr.x),
        y: parseInt(deltaStr.y),
    }

    const newPos = {
        row: incRowColId(pos.row, delta.y),
        col: incRowColId(pos.col, delta.x),
    }

    console.log('new pos = ', newPos)

    switch (action) {
    case 'action/move-left':
        return;
    case 'action/move-up':
        return;
    case 'action/move-right':
        return;
    case 'action/move-down':
        return;
    }

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
