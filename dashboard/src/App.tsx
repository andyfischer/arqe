import React from 'react';
import './App.css';
import { Graph } from 'inke'

const graph = new Graph();
graph.run('set app ws-sync/1');
graph.run('set app ws-sync/1 .host == http://localhost:42940');
const data = graph.context('app');

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
