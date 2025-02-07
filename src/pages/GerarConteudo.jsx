/** src/pages/GerarConteudo.jsx **/

import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function GerarConteudo() {
  // Campos do formulário
  const [vertical, setVertical] = useState('');
  const [pillar, setPillar] = useState('');
  const [contentType, setContentType] = useState('post');
  const [targetAudience, setTargetAudience] = useState('Consultores Imobiliários');
  const [topic, setTopic] = useState('');
  const [minWords, setMinWords] = useState(300);
  const [maxWords, setMaxWords] = useState(1000);
  const [writingTone, setWritingTone] = useState('profissional');
  const [complexity, setComplexity] = useState('média');

  // GPT result
  const [contentResult, setContentResult] = useState('');
  const [slug, setSlug] = useState('');
  const [fraseChave, setFraseChave] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [resumoPesquisa, setResumoPesquisa] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Carregar verticais e pilares do localStorage
  const [verticalOptions, setVerticalOptions] = useState([]);
  const [pillarOptions, setPillarOptions] = useState([]);

  // 1) Ao montar, carrega os dados
  useEffect(() => {
    const storedVerticals = localStorage.getItem('adminVerticals');
    if (storedVerticals) {
      setVerticalOptions(Object.keys(JSON.parse(storedVerticals)));
    }
    const storedPillars = localStorage.getItem('adminPillars');
    if (storedPillars) {
      setPillarOptions(Object.keys(JSON.parse(storedPillars)));
    }
  }, []);

  // 2) Limpa feedback depois de uns segundos
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // 3) Função para chamar GPT e gerar conteúdo
  const handleGenerate = async () => {
    setError('');
    setFeedback('Gerando conteúdo... aguarde.');
    setContentResult('');

    if (!vertical) {
      setError('Selecione uma Vertical.');
      setFeedback('');
      return;
    }
    if (!pillar) {
      setError('Selecione um Pilar.');
      setFeedback('');
      return;
    }

    try {
      const prompt = `
      Você é um assistente que gera conteúdo em formato Markdown. Considere estes parâmetros:
      - Vertical: ${vertical}
      - Pilar: ${pillar}
      - Tipo de Conteúdo: ${contentType}
      - Público-Alvo: ${targetAudience}
      - Tópico específico: ${topic || '(Se não houver, escolha algo relevante)'}
      - Tamanho mínimo: ${minWords} palavras
      - Tamanho máximo: ${maxWords} palavras
      - Tom de escrita: ${writingTone}
      - Complexidade: ${complexity}
      
      Gere um texto usando H1, H2, negritos, etc., com formatação Markdown, e ao final retorne também em JSON (como comentários ou no final) as seguintes informações:
      - slug
      - fraseChave
      - etiquetas
      - hashtags
      - resumoPesquisa
      `;

      // Lendo a Key do ChatGPT
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      // Se preferir, no Netlify console, tente renomear a var para `VITE_OPENAI_API_KEY`,
      // e use: const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

      if (!OPENAI_API_KEY) {
        setError('A variável OPENAI_API_KEY não foi encontrada. Verifique se você a definiu no Netlify e no build do Vite.');
        setFeedback('');
        return;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente de criação de conteúdo para blogs.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        throw new Error(`Erro da API: ${response.status}`);
      }

      const data = await response.json();
      const textResult = data?.choices?.[0]?.message?.content || '';
      if (!textResult) {
        throw new Error('Texto vazio retornado pela API.');
      }

      // Separar o trecho markdown do trecho JSON
      let pureText = textResult;
      let metadata = {};

      // Captura bloco ```json ... ```
      const regex = /```json([\s\S]*?)```/;
      const match = textResult.match(regex);
      if (match) {
        const jsonRaw = match[1].trim();
        pureText = textResult.replace(regex, '').trim();
        try {
          metadata = JSON.parse(jsonRaw);
        } catch (err) {
          console.error('Erro no parse do JSON:', err);
        }
      }

      setContentResult(pureText);
      setSlug(metadata.slug || '');
      setFraseChave(metadata.fraseChave || '');
      setEtiquetas(metadata.etiquetas || '');
      setHashtags(metadata.hashtags || '');
      setResumoPesquisa(metadata.resumoPesquisa || '');
      setFeedback('Conteúdo gerado com sucesso!');
    } catch (err) {
      setError('Erro ao gerar conteúdo: ' + err.message);
      setFeedback('');
    }
  };

  // 4) Função para exportar docx
  const exportDoc = async () => {
    if (!contentResult) {
      setError('Não há conteúdo para exportar.');
      return;
    }
    setError('');

    try {
      // Monta doc
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Conteúdo Gerado', bold: true, size: 32 })]
              }),
              new Paragraph({
                children: [new TextRun({ text: contentResult, size: 24 })]
              }),
              new Paragraph({
                children: [new TextRun({ text: `Slug: ${slug}`, italics: true })]
              }),
              new Paragraph({
                children: [new TextRun({ text: `Frase-chave: ${fraseChave}` })]
              }),
              new Paragraph({
                children: [new TextRun({ text: `Etiquetas: ${etiquetas}` })]
              }),
              new Paragraph({
                children: [new TextRun({ text: `Hashtags: ${hashtags}` })]
              }),
              new Paragraph({
                children: [new TextRun({ text: `Resumo: ${resumoPesquisa}` })]
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'conteudo-gerado.docx');
      setFeedback('Arquivo .docx exportado com sucesso!');
    } catch (err) {
      setError('Erro ao exportar: ' + err.message);
    }
  };

  // 5) Publicar
  const handlePublish = () => {
    if (!vertical) {
      setError('Selecione a vertical antes de publicar.');
      return;
    }
    if (!contentResult) {
      setError('Gere o conteúdo antes de publicar.');
      return;
    }
    setError('');

    // Carrega dados da vertical
    const stored = localStorage.getItem('adminVerticals');
    if (!stored) {
      setFeedback('Nenhuma vertical cadastrada no localStorage.');
      return;
    }
    const vertObj = JSON.parse(stored);
    const found = vertObj[vertical];
    if (!found) {
      setFeedback(`A vertical "${vertical}" não foi encontrada.`);
      return;
    }

    // Exemplo: pergunta onde publicar
    const possibleLocations = [];
    if (found.blogUrl) possibleLocations.push('BlogUrl');
    if (found.instagram) possibleLocations.push('Instagram');
    if (found.facebook) possibleLocations.push('Facebook');
    if (found.linkedin) possibleLocations.push('LinkedIn');

    if (possibleLocations.length === 0) {
      setFeedback(`A vertical "${vertical}" não tem locais de publicação configurados.`);
      return;
    }

    const selected = window.prompt(
      `Onde deseja publicar? Opções: ${possibleLocations.join(', ')}\n` +
      'Digite separado por vírgula, ou cancele para não publicar agora.'
    );
    if (selected) {
      setFeedback(`Publicação solicitada em: ${selected}. (placeholder)`);
      // Integração real com WP ou outras plataformas viria aqui.
    } else {
      setFeedback('Publicação cancelada.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <h1 className="text-3xl font-bold mb-4">Gerar Conteúdo</h1>

      {error && <div className="bg-red-200 text-red-800 p-2 rounded mb-4">{error}</div>}
      {feedback && <div className="bg-green-200 text-green-800 p-2 rounded mb-4">{feedback}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Vertical */}
        <div>
          <label className="block font-medium mb-1">Vertical:</label>
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione a vertical</option>
            {verticalOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Pilar */}
        <div>
          <label className="block font-medium mb-1">Pilar:</label>
          <select
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione o pilar</option>
            {pillarOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Conteúdo */}
        <div>
          <label className="block font-medium mb-1">Tipo de Conteúdo:</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="post">Post</option>
            <option value="artigo">Artigo</option>
            <option value="texto">Texto</option>
            <option value="reel">Reel</option>
            <option value="carrossel">Carrossel</option>
            <option value="vídeo">Vídeo</option>
          </select>
        </div>

        {/* Público-Alvo */}
        <div>
          <label className="block font-medium mb-1">Público-Alvo:</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Consultores Imobiliários">Consultores Imobiliários</option>
            <option value="Gestores">Gestores</option>
            <option value="Vendedores">Vendedores</option>
            <option value="Clientes">Clientes</option>
          </select>
        </div>

        {/* Tópico Específico */}
        <div>
          <label className="block font-medium mb-1">Tópico Específico (opcional):</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Se vazio, GPT escolhe algo"
          />
        </div>

        {/* Tamanho mínimo */}
        <div>
          <label className="block font-medium mb-1">Tamanho mínimo (palavras):</label>
          <input
            type="number"
            value={minWords}
            onChange={(e) => setMinWords(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Tamanho máximo */}
        <div>
          <label className="block font-medium mb-1">Tamanho máximo (palavras):</label>
          <input
            type="number"
            value={maxWords}
            onChange={(e) => setMaxWords(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Tom de escrita */}
        <div>
          <label className="block font-medium mb-1">Tom de escrita:</label>
          <select
            value={writingTone}
            onChange={(e) => setWritingTone(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="formal">Formal</option>
            <option value="informal">Informal</option>
            <option value="profissional">Profissional</option>
          </select>
        </div>

        {/* Complexidade */}
        <div>
          <label className="block font-medium mb-1">Complexidade:</label>
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      {/* Botões */}
      <div className="flex space-x-4 mb-6">
        <button onClick={handleGenerate} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">
          Gerar
        </button>
        <button onClick={exportDoc} className="bg-green-600 text-white px-4 py-2 rounded font-semibold">
          Exportar doc
        </button>
        <button onClick={handlePublish} className="bg-purple-600 text-white px-4 py-2 rounded font-semibold">
          Publicar
        </button>
      </div>

      <hr className="mb-4" />

      {/* Exibição do Conteúdo Gerado */}
      <h2 className="text-xl font-bold mb-2">Resultado</h2>
      {contentResult ? (
        <div className="p-4 bg-gray-100 rounded mb-4">
          <div dangerouslySetInnerHTML={{ __html: contentResult.replace(/\n/g, '<br/>') }} />
        </div>
      ) : (
        <p className="text-gray-600 mb-4">Nenhum conteúdo gerado ainda.</p>
      )}

      {/* Metadados */}
      {contentResult && (
        <div className="p-4 bg-gray-200 rounded">
          <p><strong>Slug:</strong> {slug}</p>
          <p><strong>Frase-chave:</strong> {fraseChave}</p>
          <p><strong>Etiquetas:</strong> {etiquetas}</p>
          <p><strong>Hashtags:</strong> {hashtags}</p>
          <p><strong>Resumo para pesquisa:</strong> {resumoPesquisa}</p>
        </div>
      )}
    </div>
  );
}

export default GerarConteudo;
