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
import { Scores } from './pages/Scores'
import { Redirect } from './pages/Redirect'
import { BeatmapPage } from './pages/Beatmap'
import { Query } from './pages/Query'
import { DailyTarget } from './pages/DailyTarget'

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col">
        <Header />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/players" component={Leaderboard} />
          <Route path="/player/:id" component={PlayerPage} />
          <Route path="/noScores" component={NoScores} />
          <Route path="/activity" component={Activity} />
          <Route path="/stats" component={Stats} />
          <Route path="/scores" component={Scores} />
          <Route path="/redirect/:name" component={Redirect} />
          <Route path="/beatmap/:id" component={BeatmapPage} />
          <Route path="/query" component={Query} />
          <Route path="/daily" component={DailyTarget} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
