/** src/pages/Dashboard.jsx **/
import React, { useState } from 'react'

function Dashboard() {
  // Exemplo de estados para contadores
  const [totalPublications] = useState(30)
  const [scheduled] = useState(8)
  const [approved] = useState(22)

  return (
    <div className="w-full">
      {/* Bloco vermelho para testar se o Tailwind está funcionando */}
      <div className="bg-red-500 text-white p-4 mb-6">
        Se você vê isto em vermelho, o Tailwind está funcionando!
      </div>

      {/* Título principal */}
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Cartões de contadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg">Publicações Totais</h2>
          <p className="text-2xl">{totalPublications}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg">Agendadas</h2>
          <p className="text-2xl">{scheduled}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg">Aprovadas</h2>
          <p className="text-2xl">{approved}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;
