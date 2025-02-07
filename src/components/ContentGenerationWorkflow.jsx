/** src/components/ContentGenerationWorkflow.jsx **/
import React, { useState } from 'react'
import ContentGenerationService from '../services/contentGenerationService'

function ContentGenerationWorkflow() {
  // Estado para os parâmetros de geração
  const [params, setParams] = useState({
    pillar: '',
    contentType: '',
    textLength: '',
    targetAudience: '',
    specificTopic: '',
    complexityLevel: '',
    writingTone: ''
  })

  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setParams(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = await ContentGenerationService.generateContent(params)
    setResult(data)
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Gerar Conteúdo Automático</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pilar */}
        <div>
          <label className="block font-semibold">Pilar:</label>
          <select name="pillar" value={params.pillar} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Selecione um pilar</option>
            <option value="Gestão de Vendas">Gestão de Vendas</option>
            <option value="Vendas e Negociação">Vendas e Negociação</option>
            <option value="Marketing Digital">Marketing Digital</option>
            <option value="Desenvolvimento Profissional">Desenvolvimento Profissional</option>
          </select>
        </div>

        {/* Tipo de Conteúdo */}
        <div>
          <label className="block font-semibold">Tipo de Conteúdo:</label>
          <select name="contentType" value={params.contentType} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Selecione o tipo</option>
            <option value="Artigo">Artigo</option>
            <option value="Post">Post</option>
            <option value="Reel">Reel</option>
            <option value="Carrossel">Carrossel</option>
            <option value="Vídeo">Vídeo</option>
          </select>
        </div>

        {/* Tamanho do Texto */}
        <div>
          <label className="block font-semibold">Tamanho do Texto:</label>
          <select name="textLength" value={params.textLength} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Selecione o tamanho</option>
            <option value="Curto (300-500 palavras)">Curto (300-500 palavras)</option>
            <option value="Médio (500-1000 palavras)">Médio (500-1000 palavras)</option>
            <option value="Longo (1000-2000 palavras)">Longo (1000-2000 palavras)</option>
          </select>
        </div>

        {/* Público-Alvo */}
        <div>
          <label className="block font-semibold">Público-Alvo:</label>
          <select name="targetAudience" value={params.targetAudience} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Selecione o público</option>
            <option value="Consultores Imobiliários">Consultores Imobiliários</option>
            <option value="Gestores">Gestores</option>
            <option value="Clientes">Clientes</option>
          </select>
        </div>

        {/* Tópico Específico (Opcional) */}
        <div>
          <label className="block font-semibold">Tópico Específico (Opcional):</label>
          <input type="text" name="specificTopic" value={params.specificTopic} onChange={handleChange} placeholder="Digite um tópico específico" className="w-full p-2 border rounded"/>
        </div>

        {/* Nível de Complexidade */}
        <div>
          <label className="block font-semibold">Nível de Complexidade:</label>
          <select name="complexityLevel" value={params.complexityLevel} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Selecione o nível</option>
            <option value="Básico">Básico</option>
            <option value="Médio">Médio</option>
            <option value="Avançado">Avançado</option>
          </select>
        </div>

        {/* Tom de Escrita */}
        <div>
          <label className="block font-semibold">Tom de Escrita:</label>
          <select name="writingTone" value={params.writingTone} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Selecione o tom</option>
            <option value="Neutro">Neutro</option>
            <option value="Formal">Formal</option>
            <option value="Informal">Informal</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Gerar Conteúdo
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
          <pre className="whitespace-pre-wrap">{result.content}</pre>
        </div>
      )}
    </div>
  );
}

export default ContentGenerationWorkflow;
