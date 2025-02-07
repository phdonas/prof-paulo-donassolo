// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [totalPublicacoes, setTotalPublicacoes] = useState(0);
  const [agendadas, setAgendadas] = useState(0);
  const [aprovadas, setAprovadas] = useState(0);

  useEffect(() => {
    // Exemplo fictício: armazenar em localStorage alguma info de "conteúdos gerados" para exibir aqui
    const generated = localStorage.getItem('generatedContentsCount');
    setTotalPublicacoes(generated ? parseInt(generated, 10) : 0);

    // Se tivermos outro critério, poderíamos setar 'agendadas' e 'aprovadas' real.
    setAgendadas(0);
    setAprovadas(0);
  }, []);

  return (
    <div>
      {/* Bloco vermelho de teste do Tailwind */}
      <div className="bg-red-500 text-white p-4 mb-4">
        Se você vê isto em vermelho, Tailwind está funcionando!
    <div>
    <div className="p-4 bg-white rounded-xl shadow-custom">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-100 p-4 rounded-xl shadow-inner">
          <h2 className="font-semibold text-lg">Publicações Totais</h2>
          <p className="text-2xl">{totalPublicacoes}</p>
        </div>
        <div className="bg-neutral-100 p-4 rounded-xl shadow-inner">
          <h2 className="font-semibold text-lg">Agendadas</h2>
          <p className="text-2xl">{agendadas}</p>
        </div>
        <div className="bg-neutral-100 p-4 rounded-xl shadow-inner">
          <h2 className="font-semibold text-lg">Aprovadas</h2>
          <p className="text-2xl">{aprovadas}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
