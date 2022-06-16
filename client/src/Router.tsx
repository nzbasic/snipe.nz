import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/v2/Home";
import Leaderboard from './pages/v2/Leaderboard'
import Player from './pages/v2/Player'
import { NoScores } from './pages/NoScores'
import Activity from './pages/v2/Activity'
import Stats from './pages/v2/Stats'
import Scores from './pages/v2/Scores'
import { Redirect } from './pages/Redirect'
import { BeatmapPage } from './pages/Beatmap'
import { Query } from './pages/Query'
import { DailyTarget } from './pages/DailyTarget'

export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/player/:id" element={<Player />} />
        <Route path="/noScores" element={<NoScores />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/redirect/:name" element={<Redirect />} />
        <Route path="/beatmap/:id" element={<BeatmapPage />} />
        <Route path="/query" element={<Query />} />
        <Route path="/daily" element={<DailyTarget />} />
      </Route>
    </Routes>
  </BrowserRouter>
)