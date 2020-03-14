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

const keyNameToCode = graph.eagerValue((cxt) => {
    const map = {}
    for (const rel of cxt.getRelations('key/* browsername/*')) {
        map[rel.getTagValue('browsername')] = rel.getTag('key');
    }
    return map;
});

function handleKeyPress(key) {
    const action = api.findActionForKey(key);
    console.log('run action: ', action);

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
}

function performAction(action) {
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
