/** src/components/Layout.jsx **/
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Cabeçalho */}
      <header className="bg-primary text-white p-6 shadow-custom">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Substitua '/logo.png' pelo caminho do seu logotipo, se houver */}
            <img src="/logo.png" alt="Logo" className="w-10 h-10" />
            <h2 className="text-3xl font-bold">Gestão de Publicações PHD</h2>
          </div>
          <nav className="flex space-x-6">
            <Link to="/" className="text-lg hover:underline">Dashboard</Link>
            <Link to="/gerar-conteudo" className="text-lg hover:underline">Gerar Conteúdo</Link>
            <Link to="/admin" className="text-lg hover:underline">Admin</Link>
          </nav>
        </div>
      </header>
      
      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto p-8">
        {children}
      </main>
      
      {/* Rodapé */}
      <footer className="bg-neutral-200 text-center p-4">
        <p className="text-sm text-neutral-700">
          © {new Date().getFullYear()} Gestão de Publicações PHD. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Layout;


