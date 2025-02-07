/** src/components/Dashboard.jsx **/
import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Visão geral das publicações, cronograma editorial e métricas.</p>
      {/* Aqui você pode adicionar gráficos, contadores e outros componentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Publicações Totais</h2>
          <p className="text-2xl">25</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Agendadas</h2>
          <p className="text-2xl">5</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Aprovadas</h2>
          <p className="text-2xl">20</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
