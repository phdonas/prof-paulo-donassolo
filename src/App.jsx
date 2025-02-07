/* src/App.jsx */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import GerarConteudo from './pages/GerarConteudo';
import Biblioteca from './pages/Biblioteca';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/gerar-conteudo" element={<GerarConteudo />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
