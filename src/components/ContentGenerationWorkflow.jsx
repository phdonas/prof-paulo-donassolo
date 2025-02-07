/** src/components/ContentGenerationWorkflow.jsx **/
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

// Exemplo de import do .env (em Vite, use import.meta.env.VITE_OPENAI_API_KEY)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

const ContentGenerationWorkflow = () => {
  // Campos para formulário
  const [vertical, setVertical] = useState('Prof. Paulo H. Donassolo');
  const [pillar, setPillar] = useState('Gestão de Vendas');
  const [contentType, setContentType] = useState('Artigo');
  const [textLength, setTextLength] = useState('Médio (500-1000 palavras)');
  const [targetAudience, setTargetAudience] = useState('Consultores Imobiliários');
  const [specificTopic, setSpecificTopic] = useState('');
  const [complexityLevel, setComplexityLevel] = useState('Médio');
  const [writingTone, setWritingTone] = useState('Formal');

  // Resultado da geração
  const [generatedContent, setGeneratedContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [slug, setSlug] = useState('');

  // Loading e status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Carrega do localStorage as verticais
  const [verticalOptions, setVerticalOptions] = useState([]);
  // Carrega do localStorage os pilares (opcional, se quiser listar)
  const [pillarOptions, setPillarOptions] = useState([]);

  useEffect(() => {
    const storedPillars = JSON.parse(localStorage.getItem('pillars')) || {};
    setVerticalOptions(['Prof. Paulo H. Donassolo', 'Sou Consultor Imobiliário', 'Sou Representante Comercial', 'Academia do Gás', '4050oumais', 'Vendas Pessoais']);
    setPillarOptions(Object.keys(storedPillars));
  }, []);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleGenerateContent = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStatusMessage('Gerando conteúdo, aguarde...');

    try {
      const prompt = `
      Você é um assistente especialista em geração de conteúdo. Por favor, retorne o resultado **no formato JSON** com as chaves:
      "content", "seoTitle", "metaDescription", "hashtags", "slug".

      Gere um texto em **Markdown** que atenda às seguintes características:
      - **Vertical**: ${vertical}
      - **Pilar**: ${pillar}
      - **Tipo de Conteúdo**: ${contentType}
      - **Tamanho do Texto**: ${textLength}
      - **Público-Alvo**: ${targetAudience}
      - **Tópico Específico**: ${specificTopic || 'Nenhum'}
      - **Nível de Complexidade**: ${complexityLevel}
      - **Tom de Escrita**: ${writingTone}

      Incluir ao final do texto um bloco de observações em HTML (fonte Arial, itálico, tamanho 8) com disclaimers:
      - "Para saber mais consulte as outras publicações do Prof. Paulo H. Donassolo ou visite https://www.linkedin.com/in/paulodonassolo/"
      - "Este texto foi escrito em português do Brasil. As palavras entre aspas são usadas para descrever figuras de linguagem..."

      NÃO EXPLIQUE O FORMATO JSON. APENAS RETORNE O OBJETO JSON no corpo da resposta, sem texto extra.
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Você é um assistente especialista em redação de conteúdo para blogs e redes sociais.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        throw new Error(`Falha na chamada da API: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data?.choices?.[0]?.message?.content;

      // Tentar fazer o parse do JSON
      const parsed = JSON.parse(aiMessage);
      setGeneratedContent(parsed.content || '');
      setSeoTitle(parsed.seoTitle || '');
      setMetaDescription(parsed.metaDescription || '');
      setHashtags(parsed.hashtags || []);
      setSlug(parsed.slug || '');

      setStatusMessage('Conteúdo gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar conteúdo:', err);
      setError('Ocorreu um erro ao gerar o conteúdo. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const exportToWord = async () => {
    if (!generatedContent) {
      setError('Não há conteúdo para exportar!');
      return;
    }
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: seoTitle || 'Título do Conteúdo',
                    bold: true,
                    size: 28,
                    font: 'Arial'
                  })
                ],
                heading: 'Heading1'
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: generatedContent,
                    size: 24,
                    font: 'Arial'
                  })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Hashtags: ${hashtags.join(', ')}`,
                    italics: true,
                    size: 20,
                    font: 'Arial'
                  })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Slug: ${slug}`,
                    italics: true,
                    size: 20,
                    font: 'Arial'
                  })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Observações: Para saber mais consulte as outras publicações do Prof. Paulo H. Donassolo...',
                    italics: true,
                    size: 16,
                    font: 'Arial'
                  })
                ]
              })
            ]
          }
        ]
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'conteudo.docx');
      setStatusMessage('Exportado para Word com sucesso!');
    } catch (err) {
      setError('Erro ao exportar para Word: ' + err.message);
    }
  };

  const publicarNoWordPress = () => {
    // Carrega do localStorage a config da vertical selecionada
    const verticalConfig = JSON.parse(localStorage.getItem('verticalConfig')) || {};
    const currentConfig = verticalConfig[vertical] || {};
    if (currentConfig.blogUrl) {
      // Exemplo: abre o blogUrl em outra aba
      window.open(currentConfig.blogUrl, '_blank');
    } else {
      alert(`Nenhuma configuração de blog encontrada para a vertical "${vertical}". Configure em /admin.`);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-custom">
      <h2 className="text-2xl font-bold mb-4">Gerar Conteúdo Automático</h2>

      {statusMessage && (
        <div className="p-2 mb-4 text-center text-white bg-green-600 rounded-md">
          {statusMessage}
        </div>
      )}
      {error && (
        <div className="p-2 mb-4 text-center text-white bg-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerateContent} className="space-y-4">
        {/* Vertical */}
        <div>
          <label className="block font-semibold mb-1">Vertical:</label>
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            className="w-full p-2 border rounded-xl"
          >
            {verticalOptions.map((v, idx) => (
              <option key={idx} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Pilar */}
        <div>
          <label className="block font-semibold mb-1">Pilar:</label>
          <select
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            className="w-full p-2 border rounded-xl"
          >
            <option value="Gestão de Vendas">Gestão de Vendas</option>
            <option value="Vendas e Negociação">Vendas e Negociação</option>
            <option value="Marketing Digital">Marketing Digital</option>
            <option value="Desenvolvimento Profissional">Desenvolvimento Profissional</option>
            {/* Se quiser tornar dinâmico:
                pillarOptions.map((p) => <option>{p}</option>)
            */}
          </select>
        </div>

        {/* Tipo de Conteúdo */}
        <div>
          <label className="block font-semibold mb-1">Tipo de Conteúdo:</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full p-2 border rounded-xl"
          >
            <option value="Artigo">Artigo</option>
            <option value="Post">Post</option>
            <option value="Reel">Reel</option>
            <option value="Carrossel">Carrossel</option>
            <option value="Vídeo">Vídeo</option>
          </select>
        </div>

        {/* Tamanho do Texto */}
        <div>
          <label className="block font-semibold mb-1">Tamanho do Texto:</label>
          <select
            value={textLength}
            onChange={(e) => setTextLength(e.target.value)}
            className="w-full p-2 border rounded-xl"
          >
            <option value="Curto (300-500 palavras)">Curto (300-500 palavras)</option>
            <option value="Médio (500-1000 palavras)">Médio (500-1000 palavras)</option>
            <option value="Longo (1000-2000 palavras)">Longo (1000-2000 palavras)</option>
          </select>
        </div>

        {/* Público-alvo */}
        <div>
          <label className="block font-semibold mb-1">Público-Alvo:</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full p-2 border rounded-xl"
          >
            <option value="Consultores Imobiliários">Consultores Imobiliários</option>
            <option value="Gestores">Gestores</option>
            <option value="Clientes">Clientes</option>
            <option value="Representantes Comerciais">Representantes Comerciais</option>
          </select>
        </div>

        {/* Tópico Específico */}
        <div>
          <label className="block font-semibold mb-1">Tópico Específico (opcional):</label>
          <input
            type="text"
            value={specificTopic}
            onChange={(e) => setSpecificTopic(e.target.value)}
            placeholder="Ex: Como captar leads qualificados..."
            className="w-full p-2 border rounded-xl"
          />
        </div>

        {/* Nível de Complexidade */}
        <div>
          <label className="block font-semibold mb-1">Nível de Complexidade:</label>
          <select
            value={complexityLevel}
            onChange={(e) => setComplexityLevel(e.target.value)}
            className="w-full p-2 border rounded-xl"
          >
            <option value="Básico">Básico</option>
            <option value="Médio">Médio</option>
            <option value="Avançado">Avançado</option>
          </select>
        </div>

        {/* Tom de Escrita */}
        <div>
          <label className="block font-semibold mb-1">Tom de Escrita:</label>
          <select
            value={writingTone}
            onChange={(e) => setWritingTone(e.target.value)}
            className="w-full p-2 border rounded-xl"
          >
            <option value="Neutro">Neutro</option>
            <option value="Formal">Formal</option>
            <option value="Informal">Informal</option>
            <option value="Empolgante">Empolgante</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Gerando...' : 'Gerar Conteúdo'}
          </button>
          <button
            type="button"
            onClick={exportToWord}
            className="flex-1 bg-green-600 text-white p-2 rounded-xl hover:bg-green-700"
          >
            Exportar para Word
          </button>
          <button
            type="button"
            onClick={publicarNoWordPress}
            className="flex-1 bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700"
          >
            Publicar no WordPress
          </button>
        </div>
      </form>

      {/* Exibição do conteúdo gerado */}
      {generatedContent && (
        <div className="mt-6 p-4 bg-neutral-100 rounded">
          <h3 className="text-xl font-bold mb-2">{seoTitle || 'Título SEO não definido'}</h3>
          {metaDescription && (
            <p className="italic text-sm mb-2">MetaDescription: {metaDescription}</p>
          )}
          {hashtags.length > 0 && (
            <p className="text-sm mb-2">Hashtags: {hashtags.join(', ')}</p>
          )}
          {slug && <p className="text-sm mb-2">Slug: {slug}</p>}

          <div className="prose max-w-none mt-4">
            <ReactMarkdown>{generatedContent}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerationWorkflow;
