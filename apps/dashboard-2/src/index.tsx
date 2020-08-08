import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import GraphContext from './GraphContext'
import { initializeGraph } from './initializeGraph';
import { withClassname } from './reactUtils'
import App from './App'

function main() {

    const graph = initializeGraph();
    
    ReactDOM.render(
      <React.StrictMode>
        <GraphContext.Provider value={graph}>
          <App />
        </GraphContext.Provider>
      </React.StrictMode>,
      document.getElementById('root')
    );
}

main();
