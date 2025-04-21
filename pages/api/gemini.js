// Gemini API를 호출하는 API 엔드포인트
const GEMINI_API_KEY = 'AIzaSyAOBklure_JBFuHLbXyO8BO_A1XEKdiMTg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, examplePost, userContent, analysisResult } = req.body;

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
      prompt = `
      ### 지시사항:
      당신은 사용자가 제공한 예시 게시글과 유사한 스타일로 콘텐츠를 생성하는 AI입니다.

      다음은 참고해야 할 예시 게시글입니다:
      """
      ${examplePost}
      """

      다음은 위 예시 게시글에 대한 상세 분석 결과입니다:
      """
      ${analysisResult || '분석 결과가 없습니다.'}
      """

      위 예시 게시글의 스타일, 구조, 톤을 참고하고, 분석 결과에 명시된 특성들을 최대한 반영하여 아래 내용을 예시 게시글과 동일한 스타일로 재작성해주세요:
      """
      ${userContent}
      """

      예시 게시글의 형식, 어투, 문체, 구성 방식, 단락 구조 등을 최대한 유지하면서 내용을 재구성해주세요.
      분석 결과에 명시된 모든 특성(톤, 보이스, 개성, 스타일, 구조, 길이, 언어적 특징)을 반영하세요.
      `;
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
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