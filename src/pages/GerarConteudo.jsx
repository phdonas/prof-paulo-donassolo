/** src/pages/GerarConteudo.jsx **/

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Função para converter um texto Markdown simples (H1, H2, H3, **bold**)
 * em array de Paragraph (docx). 
 * Observa:
 *   # Título -> Heading1
 *   ## Subtítulo -> Heading2
 *   ### -> Heading3
 *   **texto** -> negrito
 * e o resto como parágrafos normais.
 */
function convertMarkdownToDocxParagraphs(markdown) {
  const paragraphs = [];

  // Quebramos por linhas
  const lines = markdown.split('\n');
  const boldRegex = /\*\*(.*?)\*\*/g; // para texto em negrito

  lines.forEach((line) => {
    let style = 'normal'; // normal, heading1, heading2, heading3
    let content = line.trim();

    // Detecta H1, H2, H3
    if (content.startsWith('# ')) {
      style = 'heading1';
      content = content.replace('# ', '').trim();
    } else if (content.startsWith('## ')) {
      style = 'heading2';
      content = content.replace('## ', '').trim();
    } else if (content.startsWith('### ')) {
      style = 'heading3';
      content = content.replace('### ', '').trim();
    }

    // Se a linha ficou vazia, ignoramos ou criamos um parágrafo vazio
    if (!content) {
      paragraphs.push(new Paragraph(''));
      return;
    }

    // Quebrar o conteúdo em Runs, separando trechos em negrito
    const matches = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(content)) !== null) {
      // texto normal antes do **
      if (match.index > lastIndex) {
        matches.push({
          text: content.substring(lastIndex, match.index),
          bold: false
        });
      }
      // texto dentro de **
      matches.push({
        text: match[1],
        bold: true
      });
      lastIndex = boldRegex.lastIndex;
    }
    // resto do texto depois do último **
    if (lastIndex < content.length) {
      matches.push({
        text: content.substring(lastIndex),
        bold: false
      });
    }

    // Monta array de TextRun
    const children = matches.map((m) =>
      new TextRun({
        text: m.text,
        bold: m.bold,
        size: style === 'heading1' ? 32 : style === 'heading2' ? 28 : style === 'heading3' ? 26 : 24
      })
    );

    let paragraph;
    switch (style) {
      case 'heading1':
        paragraph = new Paragraph({
          heading: 'Heading1',
          children
        });
        break;
      case 'heading2':
        paragraph = new Paragraph({
          heading: 'Heading2',
          children
        });
        break;
      case 'heading3':
        paragraph = new Paragraph({
          heading: 'Heading3',
          children
        });
        break;
      default:
        paragraph = new Paragraph({
          children
        });
        break;
    }

    paragraphs.push(paragraph);
  });

  return paragraphs;
}

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

  // Ao montar, carrega as Verticals e Pilares
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

  // Limpar feedback depois de uns segundos
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Gera o conteúdo via ChatGPT
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
      // Ajusta max_tokens de forma aproximada
      // Por ex., se maxWords=1000, definimos max_tokens = ~ 2000
      const tokens = Math.min(4000, Math.max(500, maxWords * 2));

      const prompt = `
      Gere um conteúdo em **Markdown** (com # Título, ## subtítulo, ### etc., **negritos**, etc.) e inclua um índice (table of contents) com links para cada seção. O texto deve ter **pelo menos ${minWords} palavras** e **no máximo ${maxWords} palavras**.  
      - Vertical: ${vertical}
      - Pilar: ${pillar}
      - Tipo de Conteúdo: ${contentType}
      - Público-Alvo: ${targetAudience}
      - Tópico específico: ${topic || 'Se não houver, escolha algo relevante'}
      - Tom de escrita: ${writingTone}
      - Complexidade: ${complexity}

      **Inclua**:  
      1. **Índice** (Table of Contents) em Markdown com links para os assuntos (ex: [Introdução](#introducao)).  
      2. Use **H1** para o título principal, **H2** para seções, **H3** para subseções.  
      3. Use negrito em palavras-chave ou conceitos importantes.  
      4. Ao final, retorne em bloco \`\`\`json ...\`\`\`:
         {
           "slug": "...",
           "fraseChave": "...",
           "etiquetas": "...",
           "hashtags": "...",
           "resumoPesquisa": "..."
         } 
      Sem explicações adicionais. 
      Garanta que o texto está **dentro** do limite de ${minWords} a ${maxWords} palavras.
      `;

      // Ler a key do .env no Netlify (ou local) => VITE_OPENAI_API_KEY
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        setError('A variável VITE_OPENAI_API_KEY não foi encontrada. Verifique se a definiu no Netlify e no .env.');
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
          max_tokens: tokens
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

      // Extrair o bloco JSON do final
      let pureText = textResult;
      let metadata = {};

      const regex = /```json([\s\S]*?)```/;
      const match = textResult.match(regex);
      if (match) {
        const jsonRaw = match[1].trim();
        pureText = textResult.replace(regex, '').trim(); // remove o bloco do corpo principal
        try {
          metadata = JSON.parse(jsonRaw);
        } catch (err) {
          console.error('Erro ao parsear JSON de metadados:', err);
        }
      }

      setContentResult(pureText);

      // Metadados
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

  // Exportar docx com "formatação" (títulos e negrito)
  const exportDoc = async () => {
    if (!contentResult) {
      setError('Não há conteúdo para exportar.');
      return;
    }
    setError('');

    try {
      // Converte markdown para array de Paragraphs
      const paragraphs = convertMarkdownToDocxParagraphs(contentResult);

      // Adicionamos também os metadados
      const metaParagraphs = [];
      if (slug) {
        metaParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Slug: ${slug}` })] }));
      }
      if (fraseChave) {
        metaParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Frase-chave: ${fraseChave}` })] }));
      }
      if (etiquetas) {
        metaParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Etiquetas: ${etiquetas}` })] }));
      }
      if (hashtags) {
        metaParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Hashtags: ${hashtags}` })] }));
      }
      if (resumoPesquisa) {
        metaParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Resumo: ${resumoPesquisa}` })] }));
      }

      const doc = new Document({
        sections: [
          {
            children: [...paragraphs, ...metaParagraphs]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'conteudo-gerado.docx');
      setFeedback('Arquivo .docx exportado com formatação básica!');
    } catch (err) {
      setError('Erro ao exportar: ' + err.message);
    }
  };

  // Publicar (placeholder)
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
      // Integração real com WP ou redes sociais virá depois
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
          {/* Exibir com ReactMarkdown para ver títulos, negritos, links, etc. */}
          <ReactMarkdown>{contentResult}</ReactMarkdown>
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

