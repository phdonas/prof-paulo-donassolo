/** src/components/AdminConfig.jsx **/
import React, { useState } from 'react';

const AdminConfig = () => {
  // Configurações ampliadas para cada vertical
  const [config, setConfig] = useState({
    vertical: "Prof. Paulo H. Donassolo",
    blogUrl: "",
    instagram: "",
    youtube: "",
    facebook: "",
    linkedin: "",
    tiktok: "",
    dataPublicacao: "",
    horarioPublicacao: "",
    etiquetas: "",
    fraseChave: "",
    apresentacaoPesquisa: "",
    tituloSEO: "",
    slug: "",
    linksInternos: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Salve as configurações (aqui usamos localStorage como exemplo)
    const currentConfig = JSON.parse(localStorage.getItem("verticalConfig")) || {};
    currentConfig[config.vertical] = config;
    localStorage.setItem("verticalConfig", JSON.stringify(currentConfig));
    console.log('Configurações salvas:', config);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Configurações de Vertical</h1>
      <form onSubmit={handleSave} className="space-y-4">
        {/* Vertical */}
        <div>
          <label className="block font-semibold">Vertical:</label>
          <select name="vertical" value={config.vertical} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="Prof. Paulo H. Donassolo">Prof. Paulo H. Donassolo</option>
            <option value="Sou Consultor Imobiliário">Sou Consultor Imobiliário</option>
            <option value="Sou Representante Comercial">Sou Representante Comercial</option>
            <option value="Academia do Gás">Academia do Gás</option>
            <option value="4050oumais">4050oumais</option>
            <option value="Vendas Pessoais">Vendas Pessoais</option>
          </select>
        </div>
        {/* Dados para Publicação */}
        <div>
          <label className="block font-semibold">URL do Blog:</label>
          <input type="url" name="blogUrl" value={config.blogUrl} onChange={handleChange} placeholder="https://seublog.com" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">Instagram:</label>
          <input type="text" name="instagram" value={config.instagram} onChange={handleChange} placeholder="@seuperfil" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">YouTube:</label>
          <input type="text" name="youtube" value={config.youtube} onChange={handleChange} placeholder="Seu canal" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">Facebook:</label>
          <input type="text" name="facebook" value={config.facebook} onChange={handleChange} placeholder="Sua página" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">LinkedIn:</label>
          <input type="text" name="linkedin" value={config.linkedin} onChange={handleChange} placeholder="Seu perfil" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">TikTok:</label>
          <input type="text" name="tiktok" value={config.tiktok} onChange={handleChange} placeholder="@seuPerfilTikTok" className="w-full p-2 border rounded" required/>
        </div>
        {/* Campos para Agendamento */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block font-semibold">Data de Publicação Padrão:</label>
            <input type="date" name="dataPublicacao" value={config.dataPublicacao} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div className="flex-1">
            <label className="block font-semibold">Horário de Publicação Padrão:</label>
            <input type="time" name="horarioPublicacao" value={config.horarioPublicacao} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>
        {/* Campos SEO */}
        <div>
          <label className="block font-semibold">Etiquetas (Tags):</label>
          <input type="text" name="etiquetas" value={config.etiquetas} onChange={handleChange} placeholder="Separe por vírgulas" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-semibold">Frase-chave Principal:</label>
          <input type="text" name="fraseChave" value={config.fraseChave} onChange={handleChange} placeholder="Digite a frase-chave" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-semibold">Apresentação da Pesquisa:</label>
          <textarea name="apresentacaoPesquisa" value={config.apresentacaoPesquisa} onChange={handleChange} placeholder="Descreva a pesquisa" className="w-full p-2 border rounded" rows="3"></textarea>
        </div>
        <div>
          <label className="block font-semibold">Título SEO:</label>
          <input type="text" name="tituloSEO" value={config.tituloSEO} onChange={handleChange} placeholder="Digite o Título SEO" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-semibold">Slug:</label>
          <input type="text" name="slug" value={config.slug} onChange={handleChange} placeholder="digite-o-slug" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-semibold">Links Internos (Menu "O que vamos ver"):</label>
          <textarea name="linksInternos" value={config.linksInternos} onChange={handleChange} placeholder="Ex: Introdução: #introducao, Desenvolvimento: #desenvolvimento, Conclusão: #conclusao" className="w-full p-2 border rounded" rows="2"></textarea>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Salvar Configurações
        </button>
      </form>
    </div>
  );
};

export default AdminConfig;

