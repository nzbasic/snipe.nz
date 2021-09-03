import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Players } from './pages/Players'
import { PlayerScores } from './pages/PlayerScores'
import { NoScores } from './pages/NoScores'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Players} />
        <Route path="/player/:id" component={PlayerScores} />
        <Route path="/noScores" component={NoScores} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
