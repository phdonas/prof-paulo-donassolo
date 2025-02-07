/** src/services/contentGenerationService.js **/

async function generateContent(params) {
  try {
    const response = await fetch('/.netlify/functions/generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error(`Erro na função Netlify: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao chamar a função Netlify:', error);
    return {
      title: 'Erro',
      content: 'Falha ao gerar conteúdo. Verifique se a função Netlify está configurada corretamente.'
    };
  }
}

export default { generateContent };