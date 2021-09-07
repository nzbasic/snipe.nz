import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Leaderboard } from './pages/Players'
import { PlayerPage } from './pages/PlayerPage'
import { NoScores } from './pages/NoScores'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Activity } from './pages/Activity'
import { Footer } from './components/Footer';
import { Stats } from './pages/Stats'

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col">
        <Header />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/players" exact component={Leaderboard} />
          <Route path="/player/:id" component={PlayerPage} />
          <Route path="/noScores" component={NoScores} />
          <Route path="/activity" component={Activity} />
          <Route path="/stats" component={Stats} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
