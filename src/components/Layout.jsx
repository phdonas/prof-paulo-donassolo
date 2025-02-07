/** src/components/Layout.jsx **/
import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Este componente cria um cabeçalho fixo com 3 links (Dashboard, Admin, Gerar Conteúdo),
 * um espaço para o conteúdo "children" e um rodapé simples.
 */
function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Cabeçalho com cor azul e texto branco */}
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
          </div>
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto p-4 flex-1">
        {children}
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-300 text-center p-2">
        <p className="text-sm text-gray-700">
          © {new Date().getFullYear()} Meu Projeto
        </p>
      </footer>
    </div>
  )
}

export default Layout;
