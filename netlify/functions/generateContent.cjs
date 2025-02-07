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

    const prompt = `
Por favor, gere um conteúdo com as seguintes características:
- **Pilar:** ${pillar}
- **Tipo de Conteúdo:** ${contentType}
- **Tamanho do Texto:** ${textLength}
- **Nível de Complexidade:** ${complexityLevel}
- **Tom de Escrita:** ${writingTone}
- **Público-Alvo:** ${targetAudience}
- **Tópico Específico:** ${specificTopic || 'Nenhum'}

Estruture o texto com uma introdução, desenvolvimento (com dicas e argumentos) e conclusão.
    `;

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em redação para blogs e redes sociais.'
        },
        {
          role: 'user',
          content: prompt
        }
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