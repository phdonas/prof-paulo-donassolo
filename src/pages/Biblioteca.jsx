/** src/pages/Biblioteca.jsx **/
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function Biblioteca() {
  const [library, setLibrary] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('genLibrary');
    if (stored) {
      setLibrary(JSON.parse(stored));
    }
  }, []);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <h1 className="text-3xl font-bold mb-4">Biblioteca</h1>
      {library.length === 0 ? (
        <p>Nenhum texto salvo ainda.</p>
      ) : (
        <table className="min-w-full bg-gray-100">
          <thead>
            <tr className="bg-gray-300 text-gray-700">
              <th className="p-2 text-left">Título</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Vertical</th>
              <th className="p-2 text-left">Pilar</th>
            </tr>
          </thead>
          <tbody>
            {library.map((item) => {
              const dateObj = new Date(item.date);
              const dateStr = dateObj.toLocaleString();

              return (
                <React.Fragment key={item.id}>
                  <tr className="border-b border-gray-200">
                    <td className="p-2">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="p-2">{dateStr}</td>
                    <td className="p-2">{item.vertical}</td>
                    <td className="p-2">{item.pillar}</td>
                  </tr>
                  {expandedId === item.id && (
                    <tr>
                      <td colSpan={4} className="p-4 bg-white">
                        <div className="bg-gray-50 p-4 rounded">
                          <ReactMarkdown>{item.content}</ReactMarkdown>
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
