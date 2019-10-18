import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import GraphContainer from './components/GraphContainer';
import MQTTContainer from './components/MQTTContainer';

function App() {
  return (
    <div className="app-root">
      <Router>
        <Switch>
          <Route path="/mqtt">
            <MQTTContainer></MQTTContainer>
          </Route>
          <Route path="/">
            <GraphContainer></GraphContainer>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
