/** src/pages/Biblioteca.jsx **/
import React, { useState, useEffect } from 'react';

function Biblioteca() {
  const [library, setLibrary] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  function loadLibrary() {
    const stored = localStorage.getItem('genLibrary');
    if (stored) {
      setLibrary(JSON.parse(stored));
    }
  }

  function toggleExpand(itemId) {
    if (expandedId === itemId) {
      setExpandedId(null);
    } else {
      setExpandedId(itemId);
    }
  }

  function handleDelete(itemId) {
    const confirmDel = window.confirm('Deseja excluir este item da biblioteca?');
    if (!confirmDel) return;
    const newLib = library.filter((x) => x.id !== itemId);
    localStorage.setItem('genLibrary', JSON.stringify(newLib));
    setLibrary(newLib);
  }

  async function handlePublish(item) {
    // Precisamos saber da vertical config. Se item.vertical for "Sou Consultor..."
    const storedVerticals = localStorage.getItem('adminVerticals');
    if (!storedVerticals) {
      setFeedback('Nenhuma vertical configurada no localStorage.');
      return;
    }
    const verticals = JSON.parse(storedVerticals);
    const vData = verticals[item.vertical];
    if (!vData) {
      setFeedback(`A vertical "${item.vertical}" não foi encontrada.`);
      return;
    }

    const targets = [];
    if (vData.blogUrl) {
      targets.push({ key: 'blog', url: vData.blogUrl });
    }
    if (vData.linkedin) {
      targets.push({ key: 'linkedin', url: vData.linkedin });
    }

    if (targets.length === 0) {
      setFeedback(`A vertical "${item.vertical}" não tem blogUrl/linkedin configurados.`);
      return;
    }
    const proceed = window.confirm(`Publicar o texto em: ${targets.map(t => t.key).join(', ')}?`);
    if (!proceed) {
      setFeedback('Publicação cancelada.');
      return;
    }

    // Precisamos atualizar item.publishedIn
    let localLib = [...library];
    const idx = localLib.findIndex(x => x.id === item.id);
    if (idx === -1) {
      setFeedback('Item não encontrado na lista.');
      return;
    }
    for (const t of targets) {
      if (t.key === 'blog') {
        const user = window.prompt('Usuário do WordPress');
        const pass = window.prompt('Senha do WordPress');
        if (!user || !pass) {
          setFeedback('Credenciais não fornecidas. Publicação no blog cancelada.');
        } else {
          try {
            await publishToWordPress(t.url, user, pass, item.content);
            if (!localLib[idx].publishedIn) localLib[idx].publishedIn = [];
            localLib[idx].publishedIn.push(`Blog(${t.url})`);
            setFeedback(`Publicado no blog: ${t.url}`);
          } catch (err) {
            setFeedback(`Erro no blog: ${err.message}`);
          }
        }
      } else if (t.key === 'linkedin') {
        const token = window.prompt('Token LinkedIn');
        if (!token) {
          setFeedback('Token não fornecido. Cancelado.');
        } else {
          try {
            await publishToLinkedIn(token, item.content);
            if (!localLib[idx].publishedIn) localLib[idx].publishedIn = [];
            localLib[idx].publishedIn.push(`LinkedIn(${t.url})`);
            setFeedback(`Publicado no LinkedIn: ${t.url}`);
          } catch (err) {
            setFeedback(`Erro no LinkedIn: ${err.message}`);
          }
        }
      }
    }
    // Salva
    localStorage.setItem('genLibrary', JSON.stringify(localLib));
    setLibrary(localLib);
  }

  async function publishToWordPress(blogUrl, user, pass, content) {
    const credentials = btoa(`${user}:${pass}`);
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
      <h1 className="text-3xl font-bold mb-4">Biblioteca</h1>
      {feedback && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-4">
          {feedback}
        </div>
      )}

      {library.length === 0 ? (
        <p>Nenhum texto salvo na biblioteca.</p>
      ) : (
        <table className="min-w-full bg-gray-100">
          <thead>
            <tr className="bg-gray-300 text-gray-700">
              <th className="p-2 text-left">Título</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Vertical</th>
              <th className="p-2 text-left">Pilar</th>
              <th className="p-2 text-left">Publicado Em</th>
              <th className="p-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {library.map((item) => {
              const dateStr = new Date(item.date).toLocaleString();
              const published = item.publishedIn && item.publishedIn.length > 0
                ? item.publishedIn.join(', ')
                : 'Nenhum';

              return (
                <React.Fragment key={item.id}>
                  <tr className="border-b border-gray-200">
                    <td className="p-2">
                      <button className="text-blue-600 underline" onClick={() => toggleExpand(item.id)}>
                        {item.title}
                      </button>
                    </td>
                    <td className="p-2">{dateStr}</td>
                    <td className="p-2">{item.vertical}</td>
                    <td className="p-2">{item.pillar}</td>
                    <td className="p-2">{published}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handlePublish(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded font-semibold"
                      >
                        Publicar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded font-semibold"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr>
                      <td colSpan={6} className="p-4 bg-white">
                        <div className="p-4 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                          {item.content}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Biblioteca;

