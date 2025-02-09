/** src/pages/GerarConteudo.jsx **/
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

/* Função simples de contagem de palavras */
function countWords(text) {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w).length;
}

/* Converte Markdown simplificado em Paragraph docx */
function convertMarkdownToDocxParagraphs(markdown) {
  const paragraphs = [];
  const lines = markdown.split('\n');
  const boldRegex = /\*\*(.*?)\*\*/g;

  lines.forEach((line) => {
    let style = 'normal';
    let content = line.trim();

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

    if (!content) {
      paragraphs.push(new Paragraph(''));
      return;
    }

    const matches = [];
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        matches.push({ text: content.substring(lastIndex, match.index), bold: false });
      }
      matches.push({ text: match[1], bold: true });
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < content.length) {
      matches.push({ text: content.substring(lastIndex), bold: false });
    }

    const children = matches.map((m) =>
      new TextRun({
        text: m.text,
        bold: m.bold,
        font: 'Calibri',
        size: style === 'heading1' ? 32 : style === 'heading2' ? 28 : style === 'heading3' ? 26 : 24
      })
    );

    let paragraph;
    if (style === 'heading1') {
      paragraph = new Paragraph({ heading: 'Heading1', children });
    } else if (style === 'heading2') {
      paragraph = new Paragraph({ heading: 'Heading2', children });
    } else if (style === 'heading3') {
      paragraph = new Paragraph({ heading: 'Heading3', children });
    } else {
      paragraph = new Paragraph({ children });
    }

    paragraphs.push(paragraph);
  });

  return paragraphs;
}

/* Gera um prompt e chama GPT */
async function callGPT({
  vertical,
  pillar,
  contentType,
  targetAudience,
  topic,
  minWords,
  maxWords,
  writingTone,
  complexity,
  attemptInfo
}) {
  const tokens = Math.min(4000, Math.max(500, maxWords * 2));
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('A variável VITE_OPENAI_API_KEY não foi encontrada.');
  }

  const prompt = `
  ${attemptInfo || ''}
  Gere um conteúdo em **Markdown** com #, ##, **negritos**, índice com links internos.
  Intervalo: >= ${minWords} palavras e <= ${maxWords} palavras.
  - Vertical: ${vertical}
  - Pilar: ${pillar}
  - Tipo: ${contentType}
  - Público: ${targetAudience}
  - Tópico: ${topic || 'Escolha relevante'}
  - Tom: ${writingTone}
  - Complexidade: ${complexity}

  Ao final, retorne \`\`\`json ...\`\`\`:
  {
    "slug": "...",
    "fraseChave": "...",
    "etiquetas": "...",
    "hashtags": "...",
    "resumoPesquisa": "..."
  }
  `;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Você é um assistente de criação de conteúdo para blogs.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: tokens
    })
  });

  if (!resp.ok) {
    throw new Error(`Erro da API GPT: ${resp.status}`);
  }

  const data = await resp.json();
  const textResult = data.choices?.[0]?.message?.content || '';
  if (!textResult) {
    throw new Error('Texto vazio retornado pela API.');
  }

  // Extrair JSON
  let pureText = textResult;
  let metadata = {};
  const regex = /```json([\s\S]*?)```/;
  const match = textResult.match(regex);
  if (match) {
    const jsonRaw = match[1].trim();
    pureText = textResult.replace(regex, '').trim();
    try {
      metadata = JSON.parse(jsonRaw);
    } catch (err) {
      console.error('Erro parse JSON:', err);
    }
  }

  const wc = countWords(pureText);
  return { text: pureText, metadata, wc };
}

function GerarConteudo() {
  // Campos
  const [vertical, setVertical] = useState('');
  const [pillar, setPillar] = useState('');
  const [contentType, setContentType] = useState('post');
  const [targetAudience, setTargetAudience] = useState('Consultores Imobiliários');
  const [topic, setTopic] = useState('');
  const [minWords, setMinWords] = useState(500);
  const [maxWords, setMaxWords] = useState(1000);
  const [writingTone, setWritingTone] = useState('profissional');
  const [complexity, setComplexity] = useState('média');

  // Resultado
  const [contentResult, setContentResult] = useState('');
  const [editorText, setEditorText] = useState('');
  const [slug, setSlug] = useState('');
  const [fraseChave, setFraseChave] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [resumoPesquisa, setResumoPesquisa] = useState('');

  // Outros
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const [verticalOptions, setVerticalOptions] = useState([]);
  const [pillarOptions, setPillarOptions] = useState([]);

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

  // #region Geração
  const handleGenerate = async () => {
    setError('');
    setFeedback('');
    setLoading(true);
    setContentResult('');
    setEditorText('');

    if (!vertical) {
      setError('Selecione uma Vertical.');
      setLoading(false);
      return;
    }
    if (!pillar) {
      setError('Selecione um Pilar.');
      setLoading(false);
      return;
    }

    try {
      let finalText = '';
      let finalMeta = {};
      let wordCount = 0;
      let attempts = 0;
      let successRange = false;

      while (attempts < 3 && !successRange) {
        attempts++;
        const attemptInfo = attempts > 1
          ? `Tentativa ${attempts}: O texto anterior não estava no range de ${minWords}..${maxWords} palavras. Ajuste.`
          : '';
        const { text, metadata, wc } = await callGPT({
          vertical,
          pillar,
          contentType,
          targetAudience,
          topic,
          minWords,
          maxWords,
          writingTone,
          complexity,
          attemptInfo
        });
        wordCount = wc;
        finalText = text;
        finalMeta = metadata;

        if (wc >= minWords && wc <= maxWords) {
          successRange = true;
        } else {
          // Mostra feedback parcial
          setFeedback(`Texto gerado com ${wc} palavras (fora do range). Tentando ajustar...`);
        }
      }

      // Se depois de 3 tentativas ainda fora do range, avisamos
      if (!successRange) {
        setFeedback(`Não foi possível chegar no range de ${minWords}..${maxWords}. Obtivemos ${wordCount} palavras. Usando o último texto...`);
      } else {
        setFeedback(`Conteúdo gerado com ${wordCount} palavras!`);
      }

      // Adiciona a observação final
      finalText += `\n\nObservação: Este texto foi criado pelo Prof. Paulo H. Donassolo com o apoio do chatGPT.`;

      setContentResult(finalText);
      setEditorText(finalText);
      setSlug(finalMeta.slug || '');
      setFraseChave(finalMeta.fraseChave || '');
      setEtiquetas(finalMeta.etiquetas || '');
      setHashtags(finalMeta.hashtags || '');
      setResumoPesquisa(finalMeta.resumoPesquisa || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // #endregion

  // #region Exportar
  const exportDoc = async () => {
    if (!editorText) {
      setError('Não há conteúdo para exportar.');
      return;
    }
    setError('');

    try {
      // Separamos a observação final
      let textMinusObservation = editorText;
      let finalObservation = '';
      const obsIndex = editorText.indexOf('Observação: Este texto foi criado');
      if (obsIndex >= 0) {
        textMinusObservation = editorText.slice(0, obsIndex).trim();
        finalObservation = editorText.slice(obsIndex).trim();
      }

      const paragraphs = convertMarkdownToDocxParagraphs(textMinusObservation);

      // Observação no final com Calibri 9
      if (finalObservation) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: finalObservation,
                font: 'Calibri',
                size: 18 // 9 pt
              })
            ]
          })
        );
      }

      // Metadados
      const metaParagraphs = [];
      if (slug) {
        metaParagraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `Slug: ${slug}`, font: 'Calibri', size: 24 })
          ]
        }));
      }
      if (fraseChave) {
        metaParagraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `Frase-chave: ${fraseChave}`, font: 'Calibri', size: 24 })
          ]
        }));
      }
      if (etiquetas) {
        metaParagraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `Etiquetas: ${etiquetas}`, font: 'Calibri', size: 24 })
          ]
        }));
      }
      if (hashtags) {
        metaParagraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `Hashtags: ${hashtags}`, font: 'Calibri', size: 24 })
          ]
        }));
      }
      if (resumoPesquisa) {
        metaParagraphs.push(new Paragraph({
          children: [
            new TextRun({ text: `Resumo: ${resumoPesquisa}`, font: 'Calibri', size: 24 })
          ]
        }));
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
      setFeedback('Arquivo .docx exportado com formatação!');
    } catch (err) {
      setError('Erro ao exportar: ' + err.message);
    }
  };
  // #endregion

  // #region Publicar
  const handlePublish = () => {
    if (!vertical) {
      setError('Selecione a vertical antes de publicar.');
      return;
    }
    if (!editorText) {
      setError('Gere o conteúdo antes de publicar.');
      return;
    }
    setError('');

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
    } else {
      setFeedback('Publicação cancelada.');
    }
  };
  // #endregion

  // #region Salvar na Biblioteca
  const handleSaveLibrary = () => {
    if (!editorText) {
      setError('Não há conteúdo para salvar.');
      return;
    }
    setError('');

    const libraryItem = {
      id: Date.now(),
      date: new Date().toISOString(),
      vertical,
      pillar,
      content: editorText
    };
    // Tentar extrair título (# Titulo)
    const firstLine = editorText.split('\n')[0] || '';
    const matchTitle = firstLine.match(/^#\s+(.*)/);
    if (matchTitle) {
      libraryItem.title = matchTitle[1].trim();
    } else {
      libraryItem.title = '(Sem Título)';
    }

    let lib = localStorage.getItem('genLibrary');
    if (lib) {
      lib = JSON.parse(lib);
    } else {
      lib = [];
    }
    lib.push(libraryItem);
    localStorage.setItem('genLibrary', JSON.stringify(lib));
    console.log('Salvo na biblioteca:', libraryItem);
    setFeedback('Conteúdo salvo na biblioteca!');
  };
  // #endregion

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <h1 className="text-3xl font-bold mb-4">Gerar Conteúdo</h1>

      {error && (
        <div className="bg-red-200 text-red-800 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Exibe "Gerando..." se loading == true */}
      {loading && (
        <div className="bg-yellow-200 text-yellow-900 p-2 rounded mb-4">
          Gerando... aguarde.
        </div>
      )}

      {/* Caso loading seja false, exibe feedback se houver */}
      {!loading && feedback && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-4">
          {feedback}
        </div>
      )}

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
        {/* Tipo */}
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
        {/* Público */}
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
        {/* Tópico */}
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
        {/* Mínimo */}
        <div>
          <label className="block font-medium mb-1">Tamanho mínimo (palavras):</label>
          <input
            type="number"
            value={minWords}
            onChange={(e) => setMinWords(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        {/* Máximo */}
        <div>
          <label className="block font-medium mb-1">Tamanho máximo (palavras):</label>
          <input
            type="number"
            value={maxWords}
            onChange={(e) => setMaxWords(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        {/* Tom */}
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
      <div className="flex space-x-2 mb-4">
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

      {/* Área de Edição */}
      {contentResult && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Editar Texto Gerado (opcional):</label>
          <textarea
            rows={12}
            className="w-full p-2 border rounded"
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
          />
          <div className="flex space-x-2 mt-2">
            <button onClick={handleSaveLibrary} className="bg-orange-500 text-white px-4 py-2 rounded font-semibold">
              Salvar na Biblioteca
            </button>
          </div>
        </div>
      )}

      {/* Pré-Visualização */}
      <h2 className="text-xl font-bold mb-2">Pré-Visualização</h2>
      {editorText ? (
        <div className="p-4 bg-gray-100 rounded mb-4">
          <ReactMarkdown>{editorText}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">Nenhum conteúdo gerado ainda.</p>
      )}

      {/* Metadados */}
      {editorText && (
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
