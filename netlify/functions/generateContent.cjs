/** netlify/functions/generateContent.cjs **/

// Tente importar a biblioteca OpenAI
const OpenAIImport = require("openai");

// Tente obter os construtores diretamente ou via .default, se disponíveis
const Configuration = OpenAIImport.Configuration || (OpenAIImport.default && OpenAIImport.default.Configuration);
const OpenAIApi = OpenAIImport.OpenAIApi || (OpenAIImport.default && OpenAIImport.default.OpenAIApi);

if (typeof Configuration !== 'function' || typeof OpenAIApi !== 'function') {
  console.error("Falha ao importar os construtores da biblioteca OpenAI. Detalhes:", OpenAIImport);
  throw new Error("Configuration não é um construtor.");
}

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

    // Prompt atualizado para solicitar um conteúdo entre 500 e 1000 palavras,
    // com seções internas ("O que vamos ver") e um bloco de observações formatado
    const prompt = `
Por favor, gere um conteúdo no formato Markdown com as seguintes características:
- O texto deve conter no máximo ${textLength} caracteres.
- Utilize H1 para o título principal, H2 para subtítulos e H3 para seções internas.
- Destaque os pontos importantes em **negrito**.
- Insira uma introdução com palavras-chave e gancho de memória que capte a atenção do leitor
- Inclua uma seção chamada "O que vamos ver" com links internos para as seções "Introdução", "Principal" e "Conclusão". Exemplo: [Introdução](#introducao), [Principal](#principal), [Conclusão](#conclusao).
- Ao final do texto, adicione um bloco de observações formatado em HTML (fonte Arial, itálico, tamanho 8) com o seguinte conteúdo:
  
  <p style="font-family: Arial; font-style: italic; font-size: 8pt;">
  OBSERVAÇÕES:<br/>
  Publicado por Prof. Paulo H. Donassolo para ${pillar}.<br/>
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

    const configurationObj = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configurationObj);

    const response = await openai.createChatCompletion({
      model: 'chatGPT o1',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em redação para blogs e redes sociais. Elabore o texto usando conceitos de copywriting/storytelling'
        },
        {
          role: 'user',
          content: prompt
        }
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
