/** src/pages/Admin.jsx **/

import React, { useState, useEffect } from 'react';

function Admin() {
  const [activeTab, setActiveTab] = useState('pillars');

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <h1 className="text-3xl font-bold mb-4">Administração</h1>

      {/* Botões de Aba */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('pillars')}
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === 'pillars' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Pilares
        </button>
        <button
          onClick={() => setActiveTab('vertical')}
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === 'vertical' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Vertical
        </button>
      </div>

      {activeTab === 'pillars' && <AbaPilares />}
      {activeTab === 'vertical' && <AbaVertical />}
    </div>
  );
}

/* ------------------------------------------------------------
   1. ABA PILARES
   ------------------------------------------------------------ */
function AbaPilares() {
  const [pillar, setPillar] = useState({ name: '', descricao: '', diretrizes: '' });
  const [pillars, setPillars] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Carrega pilares do LocalStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem('adminPillars');
    if (stored) {
      setPillars(JSON.parse(stored));
    }
  }, []);

  // Limpa feedback após alguns segundos
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPillar((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!pillar.name.trim()) return;

    const keyName = pillar.name.trim();

    // Se estamos editando
    if (editingKey) {
      // Se mudou o nome do pilar e já existe um outro com esse nome
      if (editingKey !== keyName && pillars[keyName]) {
        setFeedback('Já existe um pilar com este nome!');
        return;
      }
      // Atualiza
      const updated = { ...pillars };
      if (editingKey !== keyName) {
        delete updated[editingKey];
      }
      updated[keyName] = { ...pillar };
      setPillars(updated);
      localStorage.setItem('adminPillars', JSON.stringify(updated));
      setFeedback('Pilar atualizado!');
    } else {
      // Novo pilar
      if (pillars[keyName]) {
        setFeedback('Já existe um pilar com este nome!');
        return;
      }
      const updated = { ...pillars, [keyName]: { ...pillar } };
      setPillars(updated);
      localStorage.setItem('adminPillars', JSON.stringify(updated));
      setFeedback('Pilar adicionado!');
    }

    setPillar({ name: '', descricao: '', diretrizes: '' });
    setEditingKey(null);
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setPillar({ ...pillars[key] });
  };

  const handleRemove = (key) => {
    const confirmDel = window.confirm(`Remover o pilar "${key}"?`);
    if (!confirmDel) return;
    const updated = { ...pillars };
    delete updated[key];
    setPillars(updated);
    localStorage.setItem('adminPillars', JSON.stringify(updated));
    setFeedback(`Pilar "${key}" removido!`);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setPillar({ name: '', descricao: '', diretrizes: '' });
    setFeedback('');
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Pilares</h2>

      {feedback && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-4">{feedback}</div>
      )}

      <form onSubmit={handleAddOrUpdate} className="space-y-4 mb-8">
        <div>
          <label className="block font-medium">Nome do Pilar:</label>
          <input
            type="text"
            name="name"
            value={pillar.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Ex: Marketing Digital"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Descrição:</label>
          <textarea
            name="descricao"
            value={pillar.descricao}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Descrição breve do pilar"
          />
        </div>
        <div>
          <label className="block font-medium">Diretrizes:</label>
          <textarea
            name="diretrizes"
            value={pillar.diretrizes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Diretrizes e recomendações"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          >
            {editingKey ? 'Salvar Alterações' : 'Adicionar Pilar'}
          </button>
          {editingKey && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <hr className="mb-6" />

      <h3 className="text-xl font-semibold mb-2">Pilares Cadastrados</h3>
      {Object.keys(pillars).length === 0 ? (
        <p>Nenhum pilar cadastrado.</p>
      ) : (
        <ul className="space-y-3">
          {Object.entries(pillars).map(([key, pil]) => (
            <li key={key} className="bg-gray-100 p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold">{key}</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Descrição:</strong> {pil.descricao || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Diretrizes:</strong> {pil.diretrizes || 'N/A'}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(key)}
                    className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleRemove(key)}
                    className="bg-red-500 text-white px-3 py-1 rounded font-semibold"
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
  );
}

/* ------------------------------------------------------------
   2. ABA VERTICAL
   ------------------------------------------------------------ */
/**
 * Cada vertical tem:
 *  - Nome da Vertical
 *  - blogUrl, instagram, etc. (Campos de exemplo)
 *  - Array de pilares associados (múltiplos)
 * 
 * Armazenamos em localStorage, key: "adminVerticals"
 */
function AbaVertical() {
  const [vertical, setVertical] = useState({
    name: '',
    blogUrl: '',
    instagram: '',
    youtube: '',
    facebook: '',
    linkedin: '',
    pillars: []
  });
  const [verticals, setVerticals] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [feedback, setFeedback] = useState('');
  // Lista de pilares disponíveis
  const [pillarList, setPillarList] = useState([]);

  // Carrega as verticais salvas
  useEffect(() => {
    const stored = localStorage.getItem('adminVerticals');
    if (stored) {
      setVerticals(JSON.parse(stored));
    }
    // Carrega a lista de pilares existentes
    const storedPillars = localStorage.getItem('adminPillars');
    if (storedPillars) {
      const pObj = JSON.parse(storedPillars);
      setPillarList(Object.keys(pObj)); // Nome dos pilares
    }
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVertical((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxPillar = (pillarName) => {
    let newPillars = [...vertical.pillars];
    if (newPillars.includes(pillarName)) {
      // remove
      newPillars = newPillars.filter((p) => p !== pillarName);
    } else {
      // adiciona
      newPillars.push(pillarName);
    }
    setVertical((prev) => ({ ...prev, pillars: newPillars }));
  };

  const handleSaveVertical = (e) => {
    e.preventDefault();
    if (!vertical.name.trim()) {
      setFeedback('Nome da Vertical é obrigatório.');
      return;
    }
    const keyName = vertical.name.trim();

    // Se estamos editando
    if (editingKey) {
      if (editingKey !== keyName && verticals[keyName]) {
        setFeedback('Já existe uma vertical com este nome!');
        return;
      }
      const updated = { ...verticals };
      if (editingKey !== keyName) {
        delete updated[editingKey];
      }
      updated[keyName] = { ...vertical };
      setVerticals(updated);
      localStorage.setItem('adminVerticals', JSON.stringify(updated));
      setFeedback('Vertical atualizada com sucesso!');
    } else {
      // Nova vertical
      if (verticals[keyName]) {
        setFeedback('Já existe uma vertical com este nome!');
        return;
      }
      const updated = { ...verticals, [keyName]: { ...vertical } };
      setVerticals(updated);
      localStorage.setItem('adminVerticals', JSON.stringify(updated));
      setFeedback('Vertical adicionada com sucesso!');
    }

    // Limpa formulário
    setVertical({
      name: '',
      blogUrl: '',
      instagram: '',
      youtube: '',
      facebook: '',
      linkedin: '',
      pillars: []
    });
    setEditingKey(null);
  };

  const handleEditVertical = (key) => {
    setEditingKey(key);
    setVertical({ ...verticals[key] });
  };

  const handleRemoveVertical = (key) => {
    const confirmDel = window.confirm(`Remover a vertical "${key}"?`);
    if (!confirmDel) return;
    const updated = { ...verticals };
    delete updated[key];
    setVerticals(updated);
    localStorage.setItem('adminVerticals', JSON.stringify(updated));
    setFeedback(`Vertical "${key}" removida!`);
  };

  const handleCancelVertical = () => {
    setEditingKey(null);
    setVertical({
      name: '',
      blogUrl: '',
      instagram: '',
      youtube: '',
      facebook: '',
      linkedin: '',
      pillars: []
    });
    setFeedback('');
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Vertical</h2>

      {feedback && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-4">{feedback}</div>
      )}

      <form onSubmit={handleSaveVertical} className="space-y-4 mb-8">
        <div>
          <label className="block font-medium">Nome da Vertical:</label>
          <input
            type="text"
            name="name"
            value={vertical.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Ex: Sou Consultor Imobiliário"
          />
        </div>
        <div>
          <label className="block font-medium">URL do Blog:</label>
          <input
            type="url"
            name="blogUrl"
            value={vertical.blogUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Ex: https://seublog.com"
          />
        </div>
        <div>
          <label className="block font-medium">Instagram:</label>
          <input
            type="text"
            name="instagram"
            value={vertical.instagram}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="@seuInstagram"
          />
        </div>
        <div>
          <label className="block font-medium">YouTube:</label>
          <input
            type="text"
            name="youtube"
            value={vertical.youtube}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Canal ou URL do YouTube"
          />
        </div>
        <div>
          <label className="block font-medium">Facebook:</label>
          <input
            type="text"
            name="facebook"
            value={vertical.facebook}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Página ou perfil"
          />
        </div>
        <div>
          <label className="block font-medium">LinkedIn:</label>
          <input
            type="text"
            name="linkedin"
            value={vertical.linkedin}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Perfil no LinkedIn"
          />
        </div>
        {/* Selecionar pilares */}
        <div>
          <label className="block font-medium mb-1">Pilares Associados:</label>
          {pillarList.length === 0 ? (
            <p className="text-sm text-gray-600">Não há pilares cadastrados.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {pillarList.map((pName) => (
                <label key={pName} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={vertical.pillars.includes(pName)}
                    onChange={() => handleCheckboxPillar(pName)}
                  />
                  <span>{pName}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          >
            {editingKey ? 'Salvar Alterações' : 'Adicionar Vertical'}
          </button>
          {editingKey && (
            <button
              type="button"
              onClick={handleCancelVertical}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <hr className="mb-6" />

      <h3 className="text-xl font-semibold mb-2">Verticais Cadastradas</h3>
      {Object.keys(verticals).length === 0 ? (
        <p>Nenhuma vertical cadastrada.</p>
      ) : (
        <ul className="space-y-3">
          {Object.entries(verticals).map(([key, v]) => (
            <li key={key} className="bg-gray-100 p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold">{key}</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>BlogUrl:</strong> {v.blogUrl || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Instagram:</strong> {v.instagram || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Facebook:</strong> {v.facebook || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>LinkedIn:</strong> {v.linkedin || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Pilares:</strong>{' '}
                    {Array.isArray(v.pillars) && v.pillars.length > 0
                      ? v.pillars.join(', ')
                      : 'Nenhum'}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditVertical(key)}
                    className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleRemoveVertical(key)}
                    className="bg-red-500 text-white px-3 py-1 rounded font-semibold"
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
  );
}

export default Admin;
