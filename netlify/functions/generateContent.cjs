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

    // O prompt abaixo solicita:
    // - Um texto entre 500 e 1000 palavras
    // - Uso de H1, H2, H3, negrito, e uma seção "O que vamos ver" com links internos
    // - Ao final, um bloco de observações formatado em HTML (Arial, Itálico, tamanho 8)
    const prompt = `
Por favor, gere um conteúdo no formato Markdown com as seguintes características:
- Escreva como um profissional com mais de 20 anos de experiência no ${contentType} e no ${targetAudience} e em copywriting e storytelling.
- Utilize H1 para o título principal, H2 para subtítulos e H3 para seções internas.
- Destaque os pontos importantes em **negrito**.
- Inclua uma seção chamada "O que vamos ver" com links internos para as seções "Introdução", "Desenvolvimento" e "Conclusão". Por exemplo: [Introdução](#introducao), [Desenvolvimento](#desenvolvimento), [Conclusão](#conclusao).
- Ao final do texto, inclua um bloco de observações (formate-o em HTML com fonte Arial, itálico, tamanho 8) com o seguinte conteúdo:
  
  <p style="font-family: Arial; font-style: italic; font-size: 8pt;">
  OBSERVAÇÕES:<br/>
  Saiba mais sobre o Prof. Paulo H. Donassolo em https://www.linkedin.com/in/paulodonassolo/.<br/>
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

    // Aumentamos max_tokens para possibilitar textos maiores
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Você é um assistente especializado em redação para blogs e redes sociais.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
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
