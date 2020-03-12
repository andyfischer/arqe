import React from 'react';
import './App.css';
import { Graph } from 'ik'
import Spreadsheet from './Spreadsheet'
import GraphSource from './GraphSource'

const graph = new Graph();
graph.loadDump(GraphSource);

const keyNameToCode = graph.eagerValue((cxt) => {
    const map = {}
    for (const rel of cxt.getRelations('key/* browsername/*')) {
        map[rel.getTagValue('browsername')] = rel.getTag('key');
    }
    return map;
});

console.log('keyNameToCode = ', keyNameToCode.get())

const App: React.FC = () => {
  return (
    <div className="App">
      <Spreadsheet graph={graph} spreadsheetView="spreadsheet-view/1" />
    </div>
  );
}

export default App;
