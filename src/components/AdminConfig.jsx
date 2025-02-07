/** src/components/AdminConfig.jsx **/
import React, { useState } from 'react';

const AdminConfig = () => {
  // Estado para armazenar as configurações das verticais
  const [config, setConfig] = useState({
    vertical: '',
    blogUrl: '',
    instagram: '',
    youtube: '',
    facebook: '',
    linkedin: '',
    tiktok: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Aqui você pode salvar a configuração no banco de dados ou em localStorage
    console.log('Configurações salvas:', config);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Configurações de Vertical</h1>
      <form onSubmit={handleSave} className="space-y-4">
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
        <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700 w-full">Salvar Configurações</button>
      </form>
    </div>
  );
};

export default AdminConfig;
