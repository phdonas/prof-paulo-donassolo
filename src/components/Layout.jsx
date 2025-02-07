/** src/components/Layout.jsx **/
import React from 'react';
import { Link } from 'react-router-dom';

/** src/components/Layout.jsx **/
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Cabeçalho */}
      <header className="bg-primary text-white p-4 shadow-custom">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestão de Publicações PHD</h2>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/gerar-conteudo" className="hover:underline">Gerar Conteúdo</Link>
            <Link to="/admin" className="hover:underline">Admin</Link>
          </nav>
        </div>
      </header>
      
      {/* Sidebar (opcional) */}
      <aside className="bg-neutral-100 shadow p-4">
        <div className="container mx-auto">
          <ul className="space-y-2">
            <li><Link to="/" className="hover:underline">Dashboard</Link></li>
            <li><Link to="/gerar-conteudo" className="hover:underline">Gerar Conteúdo</Link></li>
            <li><Link to="/admin" className="hover:underline">Admin</Link></li>
          </ul>
        </div>
      </aside>
      
      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto p-6">
        {children}
      </main>
      
      {/* Rodapé */}
      <footer className="bg-neutral-200 text-center p-4">
        © {new Date().getFullYear()} Gestão de Publicações PHD
      </footer>
    </div>
  );
};

export default Layout;
