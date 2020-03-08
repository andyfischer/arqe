import React from 'react';
import './App.css';
import { Graph } from 'ik'
import Spreadsheet from './Spreadsheet'

const graph = new Graph();
graph.loadDumpFile('src/source.graph');

const App: React.FC = () => {
  return (
    <div className="App">
      <Spreadsheet graph={graph} spreadsheet="spreadsheet/1" />
    </div>
  );
}

export default App;
