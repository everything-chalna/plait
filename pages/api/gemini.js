// Gemini API를 호출하는 API 엔드포인트
const GEMINI_API_KEY = 'AIzaSyAOBklure_JBFuHLbXyO8BO_A1XEKdiMTg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, examplePost, userContent, analysisResult, temperature = 0.7 } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    if (action === 'analyze' && !examplePost) {
      return res.status(400).json({ error: 'Example post is required for analysis' });
    }

    if (action === 'generate' && (!examplePost || !userContent)) {
      return res.status(400).json({ error: 'Both example post and user content are required for generation' });
    }

    let prompt;
    if (action === 'analyze') {
      prompt = `You are a content analysis AI Assistant. Your purpose is to analyze content so that AI can generate similar style content.
The analysis should be very specific and detailed according to the following 8 categories:
The analysis categories are: Tone, Voice, Personality, Style, Structure, Length, and Language Features.

No talk; Just do.

<Content>
${examplePost}
</Content>`;
    } else if (action === 'generate') {
      prompt = `You are an AI Assistant that replicates output example styles.
Your goal is to analyze the input, understand the output example's style, and return an output in the same format.(However, the subject of the content must be input)
Preserve Tone, Voice, Personality, Style, Structure, Length, and Language Features.
Do not use Markdown style.
Return only the output.
No talk; Just do.

<input>
${userContent}
</input>

<output example>
${examplePost}
</output example>

Context Dumps:
${analysisResult}`;
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: parseFloat(temperature)
        }
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(500).json({ error: data.error.message || 'API 호출 중 오류가 발생했습니다.' });
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return res.status(200).json({ result });
  } catch (error) {
    console.error('API 처리 중 오류 발생:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
} 