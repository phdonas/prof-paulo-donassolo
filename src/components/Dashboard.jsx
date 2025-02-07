/** src/components/Dashboard.jsx **/
import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-lg">Publicações Totais</h2>
          <p className="text-2xl">30</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-lg">Agendadas</h2>
          <p className="text-2xl">8</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-lg">Aprovadas</h2>
          <p className="text-2xl">22</p>
        </div>
      </div>
      {/* Você pode adicionar gráficos, calendário editorial e outras métricas aqui */}
    </div>
  );
};

export default Dashboard;
