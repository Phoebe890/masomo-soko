// App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        {/* Your routes will go here */}
      </Layout>
    </Router>
  );
}

export default App;