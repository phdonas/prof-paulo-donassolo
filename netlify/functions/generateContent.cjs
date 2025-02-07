/** netlify/functions/generateContent.cjs **/

const { Configuration, OpenAIApi } = require('openai');

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Método não permitido. Use POST.' })
      };
    }

    const bodyData = JSON.parse(event.body);
    const {
      pillar,
      contentType,
      textLength,
      targetAudience,
      specificTopic,
      complexityLevel,
      writingTone
    } = bodyData;

    // Prompt atualizado para gerar conteúdo no formato Markdown
    const prompt = `
Por favor, gere um conteúdo no formato Markdown com as seguintes características:
- **Pilar:** ${pillar}
- **Tipo de Conteúdo:** ${contentType}
- **Tamanho do Texto:** ${textLength}
- **Nível de Complexidade:** ${complexityLevel}
- **Tom de Escrita:** ${writingTone}
- **Público-Alvo:** ${targetAudience}
- **Tópico Específico:** ${specificTopic || 'Nenhum'}

Instruções:
1. Utilize **H1** para o título principal e **H2** para subtítulos.
2. Destaque os pontos importantes usando **negrito** (usando ** para envolver o texto).
3. Formate links internos no padrão Markdown, por exemplo, [texto](URL).
4. Ao final do conteúdo, inclua uma seção separada intitulada "Metadados e Hashtags", listando:
   - Principais palavras-chave para SEO.
   - Sugestões de hashtags relevantes para WordPress, Yoast, Instagram, etc.
   
Estruture o texto com uma introdução, desenvolvimento (com dicas, argumentos e exemplos) e uma conclusão clara.
    `;

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Você é um assistente especializado em redação para blogs e redes sociais.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const aiText = response.data.choices[0].message?.content || 'Não foi possível gerar texto.';
    return {
      statusCode: 200,
      body: JSON.stringify({
        title: `Conteúdo: ${textLength}, Complexidade ${complexityLevel}`,
        content: aiText.trim()
      })
    };
  } catch (error) {
    console.error('Erro na função Netlify:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno ao gerar conteúdo.' })
    };
  }
};
