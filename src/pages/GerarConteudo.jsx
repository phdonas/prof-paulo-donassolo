/** src/pages/GerarConteudo.jsx **/
import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function countWords(text) {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w).length;
}

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
        size:
          style === 'heading1'
            ? 32
            : style === 'heading2'
            ? 28
            : style === 'heading3'
            ? 26
            : 24
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

/* Chamada GPT */
async function callGPT({
  OPENAI_API_KEY,
  vertical,
  pillar,
  pilarDiretrizes,
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

  const prompt = `
    ${attemptInfo || ''}
    Diretrizes do pilar:
    """${pilarDiretrizes || ''}"""

    Gere conteúdo em Markdown com #, ##, ** e índice (links internos).
    Entre ${minWords} e ${maxWords} palavras.

    - Vertical: ${vertical}
    - Pilar: ${pillar}
    - Tipo: ${contentType}
    - Público: ${targetAudience}
    - Tópico: ${topic || '(nenhum)'}
    - Tom: ${writingTone}
    - Complexidade: ${complexity}

    Ao final, retorne
    \`\`\`json
    {
      "slug": "...",
      "fraseChave": "...",
      "etiquetas": "...",
      "hashtags": "...",
      "resumoPesquisa": "..."
    }
    \`\`\`
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
        { role: 'system', content: 'Você é um assistente de criação de conteúdo para blogs.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: tokens
    })
  });

  if (!response.ok) {
    throw new Error(`Erro da API GPT: ${response.status}`);
  }

  const data = await response.json();
  const textResult = data.choices?.[0]?.message?.content || '';
  if (!textResult) {
    throw new Error('Texto vazio retornado.');
  }

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

export default function GerarConteudo() {
  // Form states
  const [vertical, setVertical] = useState('');
  const [pillar, setPillar] = useState('');
  const [contentType, setContentType] = useState('post');
  const [targetAudience, setTargetAudience] = useState('Consultores Imobiliários');
  const [topic, setTopic] = useState('');
  const [minWords, setMinWords] = useState(500);
  const [maxWords, setMaxWords] = useState(1000);
  const [writingTone, setWritingTone] = useState('profissional');
  const [complexity, setComplexity] = useState('média');

  // Pilares e Verticals
  const [pillarData, setPillarData] = useState({});
  const [pilarDiretrizes, setPilarDiretrizes] = useState('');
  const [verticalData, setVerticalData] = useState({});
  const [pillarOptions, setPillarOptions] = useState([]);
  const [verticalOptions, setVerticalOptions] = useState([]);

  // Texto final
  const [editorText, setEditorText] = useState(''); // iremos salvar localmente
  const [slug, setSlug] = useState('');
  const [fraseChave, setFraseChave] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [resumoPesquisa, setResumoPesquisa] = useState('');

  // Mensagens e Loading
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------- Carrega combos e re-carrega texto se houver ---------- */
  useEffect(() => {
    // Pilares
    const storedPillars = localStorage.getItem('adminPillars');
    if (storedPillars) {
      const pObj = JSON.parse(storedPillars);
      setPillarData(pObj);
      setPillarOptions(Object.keys(pObj));
    }
    // Verticals
    const storedVerticals = localStorage.getItem('adminVerticals');
    if (storedVerticals) {
      const vObj = JSON.parse(storedVerticals);
      setVerticalData(vObj);
      setVerticalOptions(Object.keys(vObj));
    }
    // Carrega texto anterior
    const oldText = localStorage.getItem('gerarConteudo_text');
    if (oldText) {
      setEditorText(oldText);
    }
  }, []);

  /* ---------- Salva editorText no localStorage sempre que mudar ---------- */
  useEffect(() => {
    localStorage.setItem('gerarConteudo_text', editorText || '');
  }, [editorText]);

  const handleSelectPillar = (pName) => {
    setPillar(pName);
    if (pName && pillarData[pName]) {
      setPilarDiretrizes(pillarData[pName].diretrizes || '');
    } else {
      setPilarDiretrizes('');
    }
  };

  // Gera texto e salva na biblioteca
  const handleGenerate = async () => {
    setError('');
    setFeedback('');
    setLoading(true);

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
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        throw new Error('VITE_OPENAI_API_KEY não foi encontrada.');
      }

      let finalText = '';
      let finalMeta = {};
      let attempts = 0;
      let successRange = false;
      let wordCount = 0;

      while (attempts < 3 && !successRange) {
        attempts++;
        const attemptMsg = attempts > 1
          ? `Tentativa ${attempts}: texto anterior fora do range ${minWords}..${maxWords}`
          : '';

        const { text, metadata, wc } = await callGPT({
          OPENAI_API_KEY,
          vertical,
          pillar,
          pilarDiretrizes,
          contentType,
          targetAudience,
          topic,
          minWords,
          maxWords,
          writingTone,
          complexity,
          attemptInfo: attemptMsg
        });

        finalText = text;
        finalMeta = metadata;
        wordCount = wc;

        if (wc >= minWords && wc <= maxWords) {
          successRange = true;
        } else {
          setFeedback(`Texto com ${wc} palavras. Ajustando...`);
        }
      }

      if (!successRange) {
        setFeedback(`Não foi possível chegar no range após 3 tentativas. Palavras: ${wordCount}.`);
      } else {
        setFeedback(`Texto gerado com ${wordCount} palavras!`);
      }

      finalText += `\n\nObservação: Este texto foi criado pelo Prof. Paulo H. Donassolo com o apoio do chatGPT.`;

      setEditorText(finalText); 
      setSlug(finalMeta.slug || '');
      setFraseChave(finalMeta.fraseChave || '');
      setEtiquetas(finalMeta.etiquetas || '');
      setHashtags(finalMeta.hashtags || '');
      setResumoPesquisa(finalMeta.resumoPesquisa || '');

      // Salva no LocalStorage e biblioteca
      saveToLibrary(finalText, []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function extractTitle(md) {
    const firstLine = md.split('\n')[0] || '';
    const match = firstLine.match(/^#\s+(.*)/);
    return match ? match[1].trim() : '(Sem Título)';
  }

  // Salva no library com publishedIn
  function saveToLibrary(content, publishedInArr) {
    const newItem = {
      id: Date.now(),
      date: new Date().toISOString(),
      vertical,
      pillar,
      content,
      publishedIn: publishedInArr
    };
    newItem.title = extractTitle(content);

    let lib = localStorage.getItem('genLibrary');
    if (lib) {
      lib = JSON.parse(lib);
    } else {
      lib = [];
    }
    lib.push(newItem);
    localStorage.setItem('genLibrary', JSON.stringify(lib));
  }

  // Export doc
  const exportDoc = async () => {
    if (!editorText) {
      setError('Não há conteúdo para exportar.');
      return;
    }
    setError('');

    try {
      let textMinusObs = editorText;
      let finalObservation = '';
      const obsIndex = editorText.indexOf('Observação: Este texto foi criado');
      if (obsIndex >= 0) {
        textMinusObs = editorText.slice(0, obsIndex).trim();
        finalObservation = editorText.slice(obsIndex).trim();
      }

      const paragraphs = convertMarkdownToDocxParagraphs(textMinusObs);

      if (finalObservation) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: finalObservation,
                font: 'Calibri',
                size: 18
              })
            ]
          })
        );
      }

      const metaParagraphs = [];
      if (slug) metaParagraphs.push(new Paragraph({ children: [ new TextRun({ text: `Slug: ${slug}`, font: 'Calibri', size: 24 }) ] }));
      if (fraseChave) metaParagraphs.push(new Paragraph({ children: [ new TextRun({ text: `Frase-chave: ${fraseChave}`, font: 'Calibri', size: 24 }) ] }));
      if (etiquetas) metaParagraphs.push(new Paragraph({ children: [ new TextRun({ text: `Etiquetas: ${etiquetas}`, font: 'Calibri', size: 24 }) ] }));
      if (hashtags) metaParagraphs.push(new Paragraph({ children: [ new TextRun({ text: `Hashtags: ${hashtags}`, font: 'Calibri', size: 24 }) ] }));
      if (resumoPesquisa) metaParagraphs.push(new Paragraph({ children: [ new TextRun({ text: `Resumo: ${resumoPesquisa}`, font: 'Calibri', size: 24 }) ] }));

      const doc = new Document({
        sections: [
          {
            children: [...paragraphs, ...metaParagraphs]
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

  // Publicar
  const handlePublish = async () => {
    if (!vertical) {
      setError('Selecione a vertical antes de publicar.');
      return;
    }
    if (!editorText) {
      setError('Gere o conteúdo antes de publicar.');
      return;
    }
    setError('');
    setFeedback('');

    const vData = verticalData[vertical];
    if (!vData) {
      setFeedback(`A vertical "${vertical}" não foi encontrada.`);
      return;
    }

    // Alvos
    const targets = [];
    if (vData.blogUrl) {
      targets.push({ key: 'blog', url: vData.blogUrl });
    }
    if (vData.linkedin) {
      targets.push({ key: 'linkedin', url: vData.linkedin });
    }

    if (targets.length === 0) {
      setFeedback('Nenhum local de publicação configurado.');
      return;
    }

    const proceed = window.confirm(`Publicar em: ${targets.map(t => t.key).join(', ')}?`);
    if (!proceed) {
      setFeedback('Publicação cancelada.');
      return;
    }

    // Vamos atualizar o item na biblioteca para inserir publishedIn.
    let lib = localStorage.getItem('genLibrary');
    if (!lib) {
      setFeedback('Nenhuma biblioteca. O texto não foi gerado ou salvo.');
      return;
    }
    let library = JSON.parse(lib);

    // Procurar item com content == editorText e vertical/pillar == ...
    let foundIndex = library.findIndex(
      (item) => item.content === editorText && item.vertical === vertical && item.pillar === pillar
    );
    if (foundIndex === -1) {
      // Se não achou, cria.
      foundIndex = library.length;
      library.push({
        id: Date.now(),
        date: new Date().toISOString(),
        vertical,
        pillar,
        content: editorText,
        publishedIn: []
      });
    }
    const item = library[foundIndex];
    if (!item.publishedIn) item.publishedIn = [];

    for (const t of targets) {
      if (t.key === 'blog') {
        const user = window.prompt('Digite o usuário do WordPress');
        const pass = window.prompt('Digite a senha do WordPress');
        if (!user || !pass) {
          setFeedback('Credenciais não fornecidas. Blog cancelado.');
        } else {
          try {
            await publishToWordPress(t.url, user, pass, editorText);
            item.publishedIn.push(`Blog(${t.url})`);
            setFeedback(`Publicado no blog: ${t.url}`);
          } catch (err) {
            setFeedback(`Erro no blog: ${err.message}`);
          }
        }
      } else if (t.key === 'linkedin') {
        const token = window.prompt('Digite o token do LinkedIn');
        if (!token) {
          setFeedback('Token não fornecido. LinkedIn cancelado.');
        } else {
          try {
            await publishToLinkedIn(token, editorText);
            item.publishedIn.push(`LinkedIn(${t.url})`);
            setFeedback(`Publicado no LinkedIn: ${t.url}`);
          } catch (err) {
            setFeedback(`Erro no LinkedIn: ${err.message}`);
          }
        }
      }
    }

    library[foundIndex] = item;
    localStorage.setItem('genLibrary', JSON.stringify(library));
    console.log('Atualizado item na biblioteca:', item);
  };

  async function publishToWordPress(blogUrl, username, password, content) {
    const credentials = btoa(`${username}:${password}`);
    const postData = {
      title: extractTitle(content),
      content,
      status: 'publish'
    };
    const response = await fetch(`${blogUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`
      },
      body: JSON.stringify(postData)
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} - ${await response.text()}`);
    }
    return await response.json();
  }

  async function publishToLinkedIn(token, content) {
    const payload = {
      author: 'urn:li:person:xxxx',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'CONNECTIONS'
      }
    };
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn: ${response.status} - ${await response.text()}`);
    }
    return await response.json();
  }

  function extractTitle(md) {
    const firstLine = md.split('\n')[0] || '';
    const match = firstLine.match(/^#\s+(.*)/);
    return match ? match[1].trim() : '(Sem Título)';
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <h1 className="text-3xl font-bold mb-4">Gerar Conteúdo</h1>

      {error && <div className="bg-red-200 text-red-800 p-2 rounded mb-4">{error}</div>}
      {loading && <div className="bg-yellow-200 text-yellow-900 p-2 rounded mb-4">Gerando texto... aguarde.</div>}
      {!loading && feedback && <div className="bg-green-200 text-green-800 p-2 rounded mb-4">{feedback}</div>}

      {/* Form de parâmetros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Vertical:</label>
          <select value={vertical} onChange={(e) => setVertical(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Selecione a vertical</option>
            {verticalOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Pilar:</label>
          <select value={pillar} onChange={(e) => handleSelectPillar(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Selecione o pilar</option>
            {pillarOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Tipo de Conteúdo:</label>
          <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full p-2 border rounded">
            <option value="post">Post</option>
            <option value="artigo">Artigo</option>
            <option value="texto">Texto</option>
            <option value="reel">Reel</option>
            <option value="carrossel">Carrossel</option>
            <option value="vídeo">Vídeo</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Público-Alvo:</label>
          <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full p-2 border rounded">
            <option value="Consultores Imobiliários">Consultores Imobiliários</option>
            <option value="Gestores">Gestores</option>
            <option value="Vendedores">Vendedores</option>
            <option value="Clientes">Clientes</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Tópico Específico (opcional):</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Tamanho mínimo (palavras):</label>
          <input type="number" value={minWords} onChange={(e) => setMinWords(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Tamanho máximo (palavras):</label>
          <input type="number" value={maxWords} onChange={(e) => setMaxWords(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Tom de escrita:</label>
          <select value={writingTone} onChange={(e) => setWritingTone(e.target.value)} className="w-full p-2 border rounded">
            <option value="formal">Formal</option>
            <option value="informal">Informal</option>
            <option value="profissional">Profissional</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Complexidade:</label>
          <select value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-full p-2 border rounded">
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      {pilarDiretrizes && (
        <div className="p-2 bg-gray-50 text-gray-800 border rounded mb-4 text-sm">
          <strong>Diretrizes do Pilar:</strong>
          <p>{pilarDiretrizes}</p>
        </div>
      )}

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

      <label className="block font-medium mb-1">Conteúdo (Markdown + edição):</label>
      <textarea
        rows={12}
        className="w-full p-2 border rounded mb-4"
        value={editorText}
        onChange={(e) => setEditorText(e.target.value)}
      />

      {editorText && (
        <div className="p-4 bg-gray-100 rounded">
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


