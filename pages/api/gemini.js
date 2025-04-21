// Gemini API를 호출하는 API 엔드포인트
const GEMINI_API_KEY = 'AIzaSyAOBklure_JBFuHLbXyO8BO_A1XEKdiMTg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
  // Content-Type 헤더 설정
  res.setHeader('Content-Type', 'application/json');
  
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
Don't include the content or topic of the content in your analysis.
No talk; Just do.

<Content>
${examplePost}
</Content>`;
    } else if (action === 'generate') {
      prompt = `You are an AI Assistant that reprocesses '<input>'.
Your goal is to generate output while maintaining the content and topic of <input>. First, look at <input> and understand its content and topic, then refer to <output example> and <output style> to return your output.
Do not use Markdown style.
Return only the output.
No talk; Just do.

<input>
${userContent}
</input>

<output example>
${examplePost}
</output example>

<output style>
${analysisResult}
</output style>`;
    }

    try {
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

      // 응답이 정상적인지 확인
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API 응답 에러:', response.status, errorText);
        return res.status(500).json({ 
          error: `Gemini API 호출 실패 (${response.status}): ${errorText.substring(0, 100)}` 
        });
      }

      // 응답 형식이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Gemini API가 JSON이 아닌 응답을 반환:', text.substring(0, 100));
        return res.status(500).json({ 
          error: 'Gemini API가 유효한 JSON 형식으로 응답하지 않았습니다.' 
        });
      }

      const data = await response.json();

      if (data.error) {
        console.error('Gemini API Error:', data.error);
        return res.status(500).json({ error: data.error.message || 'API 호출 중 오류가 발생했습니다.' });
      }

      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return res.status(200).json({ result });
    } catch (apiError) {
      console.error('Gemini API 호출 중 예외 발생:', apiError);
      return res.status(500).json({ 
        error: `Gemini API 호출 중 오류: ${apiError.message}` 
      });
    }
  } catch (error) {
    console.error('API 처리 중 오류 발생:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
} 