/** src/App.jsx **/
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Layout com menu + cabeçalho
import Layout from './components/Layout'

// Páginas
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import GerarConteudo from './pages/GerarConteudo'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Rota para Dashboard */}
          <Route path="/" element={<Dashboard />} />
          {/* Rota para Admin */}
          <Route path="/admin" element={<Admin />} />
          {/* Rota para GerarConteudo */}
          <Route path="/gerar-conteudo" element={<GerarConteudo />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;
