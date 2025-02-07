/** src/components/Layout.jsx **/
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold">Gestão de Publicações PHD</h2>
          <nav>
            <Link to="/" className="mr-4 hover:underline">Dashboard</Link>
            <Link to="/gerar-conteudo" className="mr-4 hover:underline">Gerar Conteúdo</Link>
            <Link to="/admin" className="hover:underline">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-200 text-center p-4">
        © {new Date().getFullYear()} Gestão de Publicações PHD
      </footer>
    </div>
  );
};

export default Layout;

