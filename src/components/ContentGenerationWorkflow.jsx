/** src/components/ContentGenerationWorkflow.jsx **/
import React, { useState } from 'react';
import ContentGenerationService from '../services/contentGenerationService';
import ReactMarkdown from 'react-markdown';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const defaultParams = {
  vertical: "Prof. Paulo H. Donassolo",
  pillar: "Gestão de Vendas",
  contentType: "Artigo",
  textLength: "Médio (500-1000 palavras)",
  targetAudience: "Consultores Imobiliários",
  specificTopic: "",
  complexityLevel: "Básico",
  writingTone: "Neutro"
};

const ContentGenerationWorkflow = () => {
  const [params, setParams] = useState(defaultParams);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await ContentGenerationService.generateContent(params);
    setResult(data);
    setLoading(false);
  };

  // Função para exportar o conteúdo para DOCX com formatação para o bloco de observações
  const exportToWord = async () => {
    if (!result) return;
    // Cria um documento simples
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: result.title,
                  bold: true,
                  size: 28,
                  font: "Arial"
                })
              ],
              heading: "Heading1"
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: result.content,
                  size: 24,
                  font: "Arial"
                })
              ]
            }),
            // Aqui adicionamos um bloco de observações com formatação específica
            new Paragraph({
              children: [
                new TextRun({
                  text: "OBSERVAÇÕES: Para saber mais sobre o Prof. Paulo H. Donassolo e nossas outras publicações visite https://www.linkedin.com/in/paulodonassolo/. Código: " + params.vertical.slice(0,3).toUpperCase() + "-001",
                  italics: true,
                  size: 16,
                  font: "Arial"
                })
              ]
            })
          ]
        }
      ]
    });
    // Gera o documento DOCX
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "conteudo.docx");
  };

  // Função placeholder para "Publicar no WordPress"
  const publicarNoWordPress = () => {
    // Aqui você pode integrar com a API do WordPress ou redirecionar para a URL configurada na vertical
    // Por exemplo, usando um valor simulado armazenado no localStorage ou configurado em Admin
    const config = JSON.parse(localStorage.getItem("verticalConfig"));
    if (config && config[params.vertical] && config[params.vertical].blogUrl) {
      window.open(config[params.vertical].blogUrl, '_blank');
    } else {
      alert("Nenhuma configuração de blog encontrada para a vertical " + params.vertical);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gerar Conteúdo Automático</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vertical */}
        <div>
          <label className="block font-semibold">Vertical:</label>
          <select name="vertical" value={params.vertical} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="Prof. Paulo H. Donassolo">Prof. Paulo H. Donassolo</option>
            <option value="Sou Consultor Imobiliário">Sou Consultor Imobiliário</option>
            <option value="Sou Representante Comercial">Sou Representante Comercial</option>
            <option value="Academia do Gás">Academia do Gás</option>
            <option value="4050oumais">4050oumais</option>
            <option value="Vendas Pessoais">Vendas Pessoais</option>
          </select>
        </div>
        {/* Pilar */}
        <div>
          <label className="block font-semibold">Pilar:</label>
          <select name="pillar" value={params.pillar} onChange={handleChange} className="w-full p-2 border rounded" required>
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
            <option value="Médio (500-1000 palavras)">Médio (500-1000 palavras)</option>
            <option value="Curto (300-500 palavras)">Curto (300-500 palavras)</option>
            <option value="Longo (1000-2000 palavras)">Longo (1000-2000 palavras)</option>
          </select>
        </div>
        {/* Público-Alvo */}
        <div>
          <label className="block font-semibold">Público-Alvo:</label>
          <select name="targetAudience" value={params.targetAudience} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="Consultores Imobiliários">Consultores Imobiliários</option>
            <option value="Gestores">Gestores</option>
            <option value="Clientes">Clientes</option>
          </select>
        </div>
        {/* Tópico Específico */}
        <div>
          <label className="block font-semibold">Tópico Específico (Opcional):</label>
          <input type="text" name="specificTopic" value={params.specificTopic} onChange={handleChange} placeholder="Digite um tópico específico" className="w-full p-2 border rounded"/>
        </div>
        {/* Nível de Complexidade */}
        <div>
          <label className="block font-semibold">Nível de Complexidade:</label>
          <select name="complexityLevel" value={params.complexityLevel} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="Básico">Básico</option>
            <option value="Médio">Médio</option>
            <option value="Avançado">Avançado</option>
          </select>
        </div>
        {/* Tom de Escrita */}
        <div>
          <label className="block font-semibold">Tom de Escrita:</label>
          <select name="writingTone" value={params.writingTone} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="Neutro">Neutro</option>
            <option value="Formal">Formal</option>
            <option value="Informal">Informal</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {loading ? 'Gerando...' : 'Gerar Conteúdo'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 className="text-xl font-bold mb-2">{result.title}</h3>
          <div className="prose max-w-none">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>
          <div className="mt-4 flex space-x-4">
            <button onClick={exportToWord} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
              Exportar para Word
            </button>
            <button onClick={publicarNoWordPress} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
              Publicar no WordPress
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerationWorkflow;
