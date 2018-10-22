import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// Polyfills
import 'pepjs';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
