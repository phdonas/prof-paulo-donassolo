/** src/components/AdminConfig.jsx **/
import React, { useState, useEffect } from 'react';

const AdminConfig = () => {
  const [verticalList] = useState([
    'Prof. Paulo H. Donassolo',
    'Sou Consultor Imobiliário',
    'Sou Representante Comercial',
    'Academia do Gás',
    '4050oumais',
    'Vendas Pessoais'
  ]);

  const [config, setConfig] = useState({
    vertical: 'Prof. Paulo H. Donassolo',
    blogUrl: '',
    instagram: '',
    youtube: '',
    facebook: '',
    linkedin: '',
    tiktok: '',
    dataPublicacao: '',
    horarioPublicacao: '',
    etiquetas: '',
    fraseChave: '',
    apresentacaoPesquisa: '',
    tituloSEO: '',
    slug: '',
    linksInternos: ''
  });

  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Ao montar, carrega config do localStorage para a vertical inicial
    loadConfig(config.vertical);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const loadConfig = (vertical) => {
    const storedConfig = JSON.parse(localStorage.getItem('verticalConfig')) || {};
    const found = storedConfig[vertical];
    if (found) {
      setConfig(found);
    } else {
      // Se não achar, reset para default, mas mantemos a vertical
      setConfig((prev) => ({
        ...prev,
        vertical,
        blogUrl: '',
        instagram: '',
        youtube: '',
        facebook: '',
        linkedin: '',
        tiktok: '',
        dataPublicacao: '',
        horarioPublicacao: '',
        etiquetas: '',
        fraseChave: '',
        apresentacaoPesquisa: '',
        tituloSEO: '',
        slug: '',
        linksInternos: ''
      }));
    }
  };

  const handleSelectVertical = (e) => {
    const newVertical = e.target.value;
    loadConfig(newVertical);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const currentConfig = JSON.parse(localStorage.getItem('verticalConfig')) || {};
    currentConfig[config.vertical] = config;
    localStorage.setItem('verticalConfig', JSON.stringify(currentConfig));
    setStatusMessage('Configurações salvas com sucesso!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Configurações de Vertical</h1>

      {statusMessage && (
        <div className="p-2 mb-4 text-center text-white bg-green-600 rounded-md">
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dados Gerais */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Dados Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Vertical:</label>
              <select
                name="vertical"
                value={config.vertical}
                onChange={handleSelectVertical}
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
                required
              >
                {verticalList.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">URL do Blog:</label>
              <input
                type="url"
                name="blogUrl"
                value={config.blogUrl}
                onChange={handleChange}
                placeholder="https://seublog.com"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Instagram:</label>
              <input
                type="text"
                name="instagram"
                value={config.instagram}
                onChange={handleChange}
                placeholder="@seuperfil"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">YouTube:</label>
              <input
                type="text"
                name="youtube"
                value={config.youtube}
                onChange={handleChange}
                placeholder="URL ou nome do canal"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Facebook:</label>
              <input
                type="text"
                name="facebook"
                value={config.facebook}
                onChange={handleChange}
                placeholder="Sua página do Facebook"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">LinkedIn:</label>
              <input
                type="text"
                name="linkedin"
                value={config.linkedin}
                onChange={handleChange}
                placeholder="Seu perfil no LinkedIn"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">TikTok:</label>
              <input
                type="text"
                name="tiktok"
                value={config.tiktok}
                onChange={handleChange}
                placeholder="@seuPerfilTikTok"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>
        </section>

        {/* Agendamento */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Agendamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Data de Publicação Padrão:</label>
              <input
                type="date"
                name="dataPublicacao"
                value={config.dataPublicacao}
                onChange={handleChange}
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Horário de Publicação Padrão:</label>
              <input
                type="time"
                name="horarioPublicacao"
                value={config.horarioPublicacao}
                onChange={handleChange}
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>
        </section>

        {/* SEO e Links Internos */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">SEO e Links Internos</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block font-semibold mb-1">Etiquetas (Tags):</label>
              <input
                type="text"
                name="etiquetas"
                value={config.etiquetas}
                onChange={handleChange}
                placeholder="Separe por vírgulas (ex: vendas, marketing, negociação)"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Frase-chave Principal (Yoast):</label>
              <input
                type="text"
                name="fraseChave"
                value={config.fraseChave}
                onChange={handleChange}
                placeholder="Ex: Gestão de Vendas"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Apresentação da Pesquisa (Yoast):</label>
              <textarea
                name="apresentacaoPesquisa"
                value={config.apresentacaoPesquisa}
                onChange={handleChange}
                placeholder="Descreva o objetivo do artigo do ponto de vista de SEO"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
                rows="3"
              ></textarea>
            </div>
            <div>
              <label className="block font-semibold mb-1">Título SEO:</label>
              <input
                type="text"
                name="tituloSEO"
                value={config.tituloSEO}
                onChange={handleChange}
                placeholder="Máximo de 60 caracteres (recomendado)"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Slug (Yoast):</label>
              <input
                type="text"
                name="slug"
                value={config.slug}
                onChange={handleChange}
                placeholder="ex: como-melhorar-as-vendas"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Links Internos (Menu 'O que vamos ver'):</label>
              <textarea
                name="linksInternos"
                value={config.linksInternos}
                onChange={handleChange}
                placeholder="Ex: Introdução -> #introducao, Desenvolvimento -> #desenvolvimento, Conclusão -> #conclusao"
                className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light"
                rows="2"
              ></textarea>
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700"
        >
          Salvar Configurações
        </button>
      </form>
    </div>
  );
};

export default AdminConfig;
