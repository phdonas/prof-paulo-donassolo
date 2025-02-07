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

    // Gere um conteúdo entre 500 e 1000 palavras.
    // Solicite também que o texto inclua uma seção "O que vamos ver" com links internos para os principais tópicos.
    // Ao final, adicione um bloco de observações formatado em HTML com fonte Arial, itálico, tamanho 8.
    const prompt = `
Gere um conteúdo no formato Markdown com as seguintes características e formato:
- O texto deve conter entre 500 e 1000 palavras.
- Utilize H1 para o título, H2 para subtítulos e H3 para seções internas.
- Destaque os itens importantes em **negrito**.
- Insira uma seção intitulada "O que vamos ver" com um menu de links internos para os principais tópicos (ex.: [Introdução](#introducao), [Desenvolvimento](#desenvolvimento), [Conclusão](#conclusao)).
- No final do conteúdo, adicione um bloco com as seguintes observações (formatado em HTML com fonte Arial, itálico, tamanho 8):
  
  <p style="font-family: Arial; font-style: italic; font-size: 8pt;">
  OBSERVAÇÕES:<br/>
  Este texto foi escrito em português do Brasil. As palavras entre aspas são usadas para descrever figuras de linguagem ou termos que podem ser considerados polêmicos por alguns indivíduos. Eles não representam nenhum preconceito ou posição sociopolítico, filosófico, religioso, econômico ou ideológico. <br/>
  Código: ${pillar.slice(0,3).toUpperCase()}-${Date.now()}
  </p>
  
Utilize os seguintes parâmetros para o conteúdo:
- **Pilar:** ${pillar}
- **Tipo de Conteúdo:** ${contentType}
- **Tamanho do Texto:** ${textLength}
- **Nível de Complexidade:** ${complexityLevel}
- **Tom de Escrita:** ${writingTone}
- **Público-Alvo:** ${targetAudience}
- **Tópico Específico:** ${specificTopic || 'Nenhum'}
  
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
      max_tokens: 1500,  // aumentando max_tokens para possibilitar textos maiores
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
