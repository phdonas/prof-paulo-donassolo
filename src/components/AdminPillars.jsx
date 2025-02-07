/** src/components/AdminPillars.jsx **/
import React, { useState, useEffect } from 'react';

const AdminPillars = () => {
  // Estado para o formulário de novo pilar
  const [pillar, setPillar] = useState({ name: "", descricao: "", diretrizes: "" });
  // Estado para a lista de pilares, armazenados como objeto, onde a chave é o nome do pilar
  const [pillars, setPillars] = useState({});

  // Carrega os pilares do localStorage ao montar o componente
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pillars"));
    if (stored) {
      setPillars(stored);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPillar(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!pillar.name) return;
    const newPillars = { ...pillars, [pillar.name]: pillar };
    setPillars(newPillars);
    localStorage.setItem("pillars", JSON.stringify(newPillars));
    setPillar({ name: "", descricao: "", diretrizes: "" });
    alert("Pilar adicionado com sucesso!");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Gerenciar Pilares</h1>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nome do Pilar:</label>
            <input
              type="text"
              name="name"
              value={pillar.name}
              onChange={handleChange}
              placeholder="Nome do Pilar"
              className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Descrição:</label>
            <textarea
              name="descricao"
              value={pillar.descricao}
              onChange={handleChange}
              placeholder="Descrição do Pilar"
              className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              rows="2"
            ></textarea>
          </div>
          <div>
            <label className="block font-semibold mb-1">Diretrizes:</label>
            <textarea
              name="diretrizes"
              value={pillar.diretrizes}
              onChange={handleChange}
              placeholder="Diretrizes para orientar a geração de conteúdo"
              className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              rows="3"
            ></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700">
            Adicionar Pilar
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pilares Cadastrados</h2>
        {Object.keys(pillars).length === 0 ? (
          <p>Nenhum pilar cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {Object.values(pillars).map((p, idx) => (
              <li key={idx} className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-custom">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p>{p.descricao}</p>
                <p className="text-sm text-neutral-600 mt-1"><strong>Diretrizes:</strong> {p.diretrizes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminPillars;
