/** src/components/Layout.jsx **/
import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <nav className="container mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">
            Meu Projeto
          </div>
          <div className="space-x-6 text-lg">
            <Link to="/" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/admin" className="hover:underline">
              Admin
            </Link>
            <Link to="/gerar-conteudo" className="hover:underline">
              Gerar Conteúdo
            </Link>
            {/* Novo link para Biblioteca */}
            <Link to="/biblioteca" className="hover:underline">
              Biblioteca
            </Link>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 flex-1">{children}</main>
      <footer className="bg-gray-300 text-center p-2">
        <p className="text-sm text-gray-700">
          © {new Date().getFullYear()} Meu Projeto
        </p>
      </footer>
    </div>
  );
}

export default Layout;
