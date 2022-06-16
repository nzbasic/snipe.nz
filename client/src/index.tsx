import ReactDOM from 'react-dom';
import './index.css'
import 'animate.css/animate.min.css'
import { Router } from './Router';
import React from 'react';

ReactDOM.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
  document.getElementById('root')
);
