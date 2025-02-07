/** src/components/AdminConfig.jsx **/
import React, { useState } from 'react';

const AdminConfig = () => {
  const [config, setConfig] = useState({
    vertical: '',
    blogUrl: '',
    instagram: '',
    youtube: '',
    facebook: '',
    linkedin: '',
    tiktok: '',
    seoTitle: '',
    mainKeyword: '',
    metaDescription: '',
    slug: '',
    tags: '',
    internalLinks: '' // Por exemplo, uma lista de tópicos ou links separados por vírgula
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Aqui você pode persistir as configurações, por exemplo, em um banco de dados ou localStorage.
    console.log('Configurações salvas:', config);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Configurações de Vertical</h1>
      <form onSubmit={handleSave} className="space-y-4">
        {/* Vertical */}
        <div>
          <label className="block font-semibold">Vertical:</label>
          <select name="vertical" value={config.vertical} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Selecione a vertical</option>
            <option value="Prof. Paulo H. Donassolo">Prof. Paulo H. Donassolo</option>
            <option value="Sou Consultor Imobiliário">Sou Consultor Imobiliário</option>
            <option value="Sou Representante Comercial">Sou Representante Comercial</option>
            <option value="Academia do Gás">Academia do Gás</option>
            <option value="4050oumais">4050oumais</option>
            <option value="Vendas Pessoais">Vendas Pessoais</option>
          </select>
        </div>
        {/* Dados dos Canais */}
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
        {/* Campos SEO */}
        <div>
          <label className="block font-semibold">Título SEO:</label>
          <input type="text" name="seoTitle" value={config.seoTitle} onChange={handleChange} placeholder="Título otimizado para SEO" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">Frase-chave Principal:</label>
          <input type="text" name="mainKeyword" value={config.mainKeyword} onChange={handleChange} placeholder="Ex: vendas, negociação" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">Meta Description:</label>
          <textarea name="metaDescription" value={config.metaDescription} onChange={handleChange} placeholder="Apresentação da pesquisa / descrição para SEO" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">Slug:</label>
          <input type="text" name="slug" value={config.slug} onChange={handleChange} placeholder="exemplo-do-slug" className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block font-semibold">Etiquetas (Tags):</label>
          <input type="text" name="tags" value={config.tags} onChange={handleChange} placeholder="tag1, tag2, tag3" className="w-full p-2 border rounded" required/>
        </div>
        {/* Campo para Links Internos */}
        <div>
          <label className="block font-semibold">O que vamos ver (Links Internos):</label>
          <textarea name="internalLinks" value={config.internalLinks} onChange={handleChange} placeholder="Exemplo: Tópico 1, Tópico 2, Tópico 3" className="w-full p-2 border rounded" required/>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Salvar Configurações
        </button>
      </form>
    </div>
  );
};

export default AdminConfig;
