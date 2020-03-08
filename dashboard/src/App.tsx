import React from 'react';
import './App.css';
import { Graph } from 'ik'
import Spreadsheet from './Spreadsheet'
import GraphSource from './GraphSource'

const graph = new Graph();
graph.loadDump(GraphSource);

const App: React.FC = () => {
  return (
    <div className="App">
      <Spreadsheet graph={graph} spreadsheet="spreadsheet/1" />
    </div>
  );
}

export default App;
