/** src/components/ContentGenerationWorkflow.jsx **/
import React, { useState } from 'react'
import ContentGenerationService from '../services/contentGenerationService'
import ReactMarkdown from 'react-markdown'

function ContentGenerationWorkflow() {
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
        {/* Campos do formulário (como já implementados) */}
        {/* Exemplo para "Pilar": */}
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
        {/* (Outros campos seguem o mesmo padrão) */}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Gerar Conteúdo
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 className="text-xl font-bold mb-2">{result.title}</h3>
          <ReactMarkdown>{result.content}</ReactMarkdown>
          {/* Se o result incluir metadados/hashtags, você pode exibi-los aqui */}
        </div>
      )}
    </div>
  );
}

export default ContentGenerationWorkflow;
