/** src/components/AdminConfig.jsx **/
import React, { useState } from 'react';

const AdminConfig = () => {
  // Inicialização dos campos de configuração para cada vertical
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
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Exemplo de salvamento: guarda as configurações no localStorage
    const currentConfig = JSON.parse(localStorage.getItem("verticalConfig")) || {};
    currentConfig[config.vertical] = config;
    localStorage.setItem("verticalConfig", JSON.stringify(currentConfig));
    console.log('Configurações salvas:', config);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Configurações de Vertical</h1>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Seção: Dados Gerais */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Dados Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Vertical:</label>
                <select name="vertical" value={config.vertical} onChange={handleChange} className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" required>
                  <option value="Prof. Paulo H. Donassolo">Prof. Paulo H. Donassolo</option>
                  <option value="Sou Consultor Imobiliário">Sou Consultor Imobiliário</option>
                  <option value="Sou Representante Comercial">Sou Representante Comercial</option>
                  <option value="Academia do Gás">Academia do Gás</option>
                  <option value="4050oumais">4050oumais</option>
                  <option value="Vendas Pessoais">Vendas Pessoais</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">URL do Blog:</label>
                <input type="url" name="blogUrl" value={config.blogUrl} onChange={handleChange} placeholder="https://seublog.com" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" required/>
              </div>
              <div>
                <label className="block font-semibold mb-1">Instagram:</label>
                <input type="text" name="instagram" value={config.instagram} onChange={handleChange} placeholder="@seuperfil" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" required/>
              </div>
              <div>
                <label className="block font-semibold mb-1">YouTube:</label>
                <input type="text" name="youtube" value={config.youtube} onChange={handleChange} placeholder="Seu canal" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" required/>
              </div>
              <div>
                <label className="block font-semibold mb-1">Facebook:</label>
                <input type="text" name="facebook" value={config.facebook} onChange={handleChange} placeholder="Sua página" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" required/>
              </div>
              <div>
                <label className="block font-semibold mb-1">LinkedIn:</label>
                <input type="text" name="linkedin" value={config.linkedin} onChange={handleChange} placeholder="Seu perfil" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" required/>
              </div>
              <div>
                <label className="block font-semibold mb-1">TikTok:</label>
                <input type="text" name="tiktok" value={config.tiktok} onChange={handleChange} placeholder="@seuPerfilTikTok" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" required/>
              </div>
            </div>
          </section>
          
          {/* Seção: Agendamento */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Agendamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Data de Publicação Padrão:</label>
                <input type="date" name="dataPublicacao" value={config.dataPublicacao} onChange={handleChange} className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Horário de Publicação Padrão:</label>
                <input type="time" name="horarioPublicacao" value={config.horarioPublicacao} onChange={handleChange} className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" />
              </div>
            </div>
          </section>
          
          {/* Seção: SEO e Links Internos */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">SEO e Links Internos</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-semibold mb-1">Etiquetas (Tags):</label>
                <input type="text" name="etiquetas" value={config.etiquetas} onChange={handleChange} placeholder="Separe por vírgulas" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Frase-chave Principal:</label>
                <input type="text" name="fraseChave" value={config.fraseChave} onChange={handleChange} placeholder="Digite a frase-chave" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Apresentação da Pesquisa:</label>
                <textarea name="apresentacaoPesquisa" value={config.apresentacaoPesquisa} onChange={handleChange} placeholder="Descreva a pesquisa" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" rows="3"></textarea>
              </div>
              <div>
                <label className="block font-semibold mb-1">Título SEO:</label>
                <input type="text" name="tituloSEO" value={config.tituloSEO} onChange={handleChange} placeholder="Digite o Título SEO" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Slug:</label>
                <input type="text" name="slug" value={config.slug} onChange={handleChange} placeholder="digite-o-slug" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Links Internos (Menu "O que vamos ver"):</label>
                <textarea name="linksInternos" value={config.linksInternos} onChange={handleChange} placeholder="Ex: Introdução: #introducao, Desenvolvimento: #desenvolvimento, Conclusão: #conclusao" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-primary-light" rows="2"></textarea>
              </div>
            </div>
          </section>
          
          <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700">
            Salvar Configurações
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminConfig;
