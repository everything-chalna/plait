import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function TestGemini() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  const handleDirectApiTest = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResult('');
    setApiResponse(null);
    
    try {
      // API 직접 호출 테스트
      const apiKey = 'AIzaSyAOBklure_JBFuHLbXyO8BO_A1XEKdiMTg';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
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
      setApiResponse(JSON.stringify(data, null, 2));
      
      if (data.error) {
        throw new Error(data.error.message || 'API 호출 중 오류가 발생했습니다.');
      }
      
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setResult(generatedText);
    } catch (error) {
      console.error('API 테스트 오류:', error);
      setError(error.message || 'API 호출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInternalApiTest = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResult('');
    setApiResponse(null);
    
    try {
      // 내부 API 엔드포인트 테스트
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze',
          examplePost: prompt
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '내부 API 호출 중 오류가 발생했습니다.');
      }
      
      setResult(data.result);
    } catch (error) {
      console.error('내부 API 테스트 오류:', error);
      setError(error.message || '내부 API 호출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Gemini 2.0 Flash API 테스트</h1>
        <p className={styles.subtitle}>API가 제대로 작동하는지 확인합니다</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.card} style={{ width: '100%', maxWidth: '800px' }}>
          <h2 className={styles.cardTitle}>프롬프트 입력</h2>
          <textarea 
            className={styles.textarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="테스트할 프롬프트를 입력하세요..."
            disabled={isLoading}
            style={{ minHeight: '100px' }}
          />
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className={`${styles.button} ${styles.analyzeButton}`}
              onClick={handleDirectApiTest}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? '처리 중...' : 'Gemini API 직접 테스트'}
            </button>
            
            <button 
              className={`${styles.button} ${styles.generateButton}`}
              onClick={handleInternalApiTest}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? '처리 중...' : '내부 API 엔드포인트 테스트'}
            </button>
          </div>
          
          {result && (
            <div className={styles.resultContent} style={{ marginBottom: '2rem' }}>
              <h3>결과:</h3>
              <pre className={styles.generatedText}>{result}</pre>
            </div>
          )}
          
          {apiResponse && (
            <div>
              <h3>전체 API 응답:</h3>
              <pre 
                style={{ 
                  background: '#f5f5f5', 
                  padding: '1rem', 
                  borderRadius: '5px', 
                  overflowX: 'auto',
                  fontSize: '0.8rem'
                }}
              >
                {apiResponse}
              </pre>
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <a href="/" className={styles.button} style={{ textDecoration: 'none' }}>
            메인 페이지로 돌아가기
          </a>
        </div>
      </main>
    </div>
  );
} 