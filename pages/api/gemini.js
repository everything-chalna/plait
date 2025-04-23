// Gemini API를 호출하는 API 엔드포인트
const GEMINI_API_KEY = 'AIzaSyDLsCh3BfcdX-TvVBcif-intfVWd45CEGA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
  // Content-Type 헤더 설정
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, examplePosts, userContent, analysisResult, temperature = 0.7 } = req.body;
    
    console.log(`======= API 호출 시작 =======`);
    console.log(`Action: ${action}`);
    console.log(`Temperature: ${temperature}`);
    console.log(`Time: ${new Date().toISOString()}`);
    
    if (action === 'analyze') {
      console.log(`Example Posts 개수: ${examplePosts?.length || 0}개`);
      examplePosts?.forEach((post, index) => {
        console.log(`Example Post ${index + 1} 길이: ${post?.length || 0}자`);
      });
    } else if (action === 'generate') {
      console.log(`Example Posts 개수: ${examplePosts?.length || 0}개`);
      examplePosts?.forEach((post, index) => {
        console.log(`Example Post ${index + 1} 길이: ${post?.length || 0}자`);
      });
      console.log(`User Content 길이: ${userContent?.length || 0}자`);
      console.log(`Analysis Result 길이: ${analysisResult?.length || 0}자`);
    }

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    if (action === 'analyze' && (!examplePosts || examplePosts.length === 0)) {
      return res.status(400).json({ error: 'At least one example post is required for analysis' });
    }

    if (action === 'generate' && (!examplePosts || examplePosts.length === 0 || !userContent)) {
      return res.status(400).json({ error: 'Both example posts and user content are required for generation' });
    }

    let prompt;
    if (action === 'analyze') {
      // 여러 개의 예시를 분석하도록 프롬프트 수정
      prompt = `You are a content analysis AI Assistant. Your task is to analyze the provided texts in detail according to the following categories:

1. Tone: Analyze the emotional quality and approach of the texts (casual, formal, advisory, etc.)
2. Voice: Identify the perspective and speaking position (first-person, third-person, etc.)
3. Personality: Describe the character traits and values that come through in the writing
4. Style: Examine the writing techniques, sentence structure, and linguistic choices
5. Structure: Analyze how the content is organized and formatted
6. Length: Provide specifics about the texts' size and reading time

Analyze the common patterns across all examples. For each category, provide specific examples from the texts to support your analysis. Be thorough and detailed, focusing on identifying patterns that would allow someone to recreate similar content.
No talk; Just do.

${examplePosts.map((post, index) => `
<Content ${index + 1}>
${post}
</Content ${index + 1}>
`).join('\n')}`;
    } else if (action === 'generate') {
      // 여러 개의 예시를 참조하여 생성하도록 프롬프트 수정
      prompt = `You are an AI Assistant that generates content.
Your purpose is to look at the <input> and generate content similar to the example outputs.
First, look at the <input> and understand the content and topic. Then, refer to the example outputs to produce your output.
Do not use Markdown style.
Return only the output.
No talk; Just do.

<input>
${userContent}
</input>

${examplePosts.map((post, index) => `
<output example ${index + 1}>
${post}
</output example ${index + 1}>
`).join('\n')}`;
    }
    
    console.log(`프롬프트 유형: ${action}`);
    console.log(`프롬프트 길이: ${prompt.length}자`);

    try {
      const startTime = Date.now();
      console.log(`Gemini API 호출 시작 - ${new Date().toISOString()}`);
      
      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: parseFloat(temperature)
        }
      };

      // generate 액션인 경우 systemInstruction 추가
      if (action === 'generate' && analysisResult) {
        requestBody.systemInstruction = {
          parts: [{ text: analysisResult }]
        };
      }
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const endTime = Date.now();
      console.log(`Gemini API 응답 수신 - 소요시간: ${endTime - startTime}ms`);

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
      
      console.log(`API 응답 결과 길이: ${result.length}자`);
      console.log(`======= API 호출 완료 =======`);
      
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