/** src/components/Layout.jsx **/
import React from 'react'
import { Link } from 'react-router-dom'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold">Prof. Paulo H. Donassolo</h2>
          <nav>
            <Link to="/" className="mr-4 hover:underline">Home</Link>
            <Link to="/gerar-conteudo" className="hover:underline">Gerar Conteúdo</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-200 p-4 text-center">
        © {new Date().getFullYear()} Prof. Paulo H. Donassolo
      </footer>
    </div>
  )
}

export default Layout
