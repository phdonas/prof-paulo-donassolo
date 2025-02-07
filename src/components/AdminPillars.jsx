/** src/components/AdminPillars.jsx **/
import React, { useState, useEffect } from 'react';

const AdminPillars = () => {
  // Estado para o formulário de criar/editar pilar
  const [pillar, setPillar] = useState({ name: '', descricao: '', diretrizes: '' });
  // Estado para a lista de pilares, armazenados como objeto, onde a chave é o nome do pilar
  const [pillars, setPillars] = useState({});
  // Estado para controlar se estamos editando
  const [editingPillarName, setEditingPillarName] = useState(null);
  // Mensagem de feedback
  const [statusMessage, setStatusMessage] = useState('');

  // Carrega os pilares do localStorage ao montar o componente
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pillars'));
    if (stored) {
      setPillars(stored);
    }
  }, []);

  // Limpa a mensagem de status depois de alguns segundos
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPillar((prev) => ({ ...prev, [name]: value }));
  };

  // Adicionar ou atualizar pilar
  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!pillar.name.trim()) return;

    const pillarName = pillar.name.trim();

    // Se estivermos editando, só atualizamos as infos
    if (editingPillarName) {
      // Se o usuário alterou o "name" e isso gerar conflito com outro pilar existente
      if (editingPillarName !== pillarName && pillars[pillarName]) {
        setStatusMessage('Já existe um pilar com esse nome.');
        return;
      }
      // Remove a key antiga, se o nome mudou
      const newPillars = { ...pillars };
      if (editingPillarName !== pillarName) {
        delete newPillars[editingPillarName];
      }
      // Salva a nova/atual
      newPillars[pillarName] = { ...pillar };
      setPillars(newPillars);
      localStorage.setItem('pillars', JSON.stringify(newPillars));
      setStatusMessage('Pilar atualizado com sucesso!');
    } else {
      // Novo pilar
      if (pillars[pillarName]) {
        setStatusMessage('Já existe um pilar com esse nome!');
        return;
      }
      const newPillars = { ...pillars, [pillarName]: { ...pillar } };
      setPillars(newPillars);
      localStorage.setItem('pillars', JSON.stringify(newPillars));
      setStatusMessage('Pilar adicionado com sucesso!');
    }

    // Reseta o formulário
    setPillar({ name: '', descricao: '', diretrizes: '' });
    setEditingPillarName(null);
  };

  const handleEdit = (nameKey) => {
    // Carrega os dados do pilar no form
    setPillar({ ...pillars[nameKey] });
    setEditingPillarName(nameKey);
  };

  const handleRemove = (nameKey) => {
    const confirmation = window.confirm(`Tem certeza que deseja remover o pilar "${nameKey}"?`);
    if (!confirmation) return;
    const newPillars = { ...pillars };
    delete newPillars[nameKey];
    setPillars(newPillars);
    localStorage.setItem('pillars', JSON.stringify(newPillars));
    setStatusMessage(`Pilar "${nameKey}" removido!`);
  };

  const handleCancelEdit = () => {
    setPillar({ name: '', descricao: '', diretrizes: '' });
    setEditingPillarName(null);
    setStatusMessage('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {editingPillarName ? 'Editar Pilar' : 'Adicionar Novo Pilar'}
      </h2>

      <form onSubmit={handleAddOrUpdate} className="space-y-4">
        {statusMessage && (
          <div className="p-2 text-center text-white bg-green-600 rounded-md">
            {statusMessage}
          </div>
        )}
        <div>
          <label className="block font-semibold mb-1">Nome do Pilar:</label>
          <input
            type="text"
            name="name"
            value={pillar.name}
            onChange={handleChange}
            placeholder="Ex: Marketing Digital"
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
            placeholder="Breve descrição deste pilar"
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
            placeholder="Instruções e recomendações para a geração de conteúdo"
            className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
            rows="3"
          ></textarea>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"
          >
            {editingPillarName ? 'Salvar Alterações' : 'Adicionar Pilar'}
          </button>
          {editingPillarName && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 bg-gray-400 text-white p-2 rounded-xl hover:bg-gray-500"
            >
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pilares Cadastrados</h2>
        {Object.keys(pillars).length === 0 ? (
          <p>Nenhum pilar cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(pillars).map(([key, p]) => (
              <li key={key} className="bg-neutral-100 dark:bg-gray-700 p-4 rounded-xl shadow-custom">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{p.name}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      <strong>Descrição:</strong> {p.descricao || 'N/A'}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">
                      <strong>Diretrizes:</strong> {p.diretrizes || 'N/A'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(key)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleRemove(key)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminPillars;
