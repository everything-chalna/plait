import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [examplePost, setExamplePost] = useState('');
  const [userContent, setUserContent] = useState('');
  const [generatedContents, setGeneratedContents] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState('');
  const [pendingGeneration, setPendingGeneration] = useState(false);
  const temperatureValues = [0, 0.5, 1.0, 1.5, 2.0];

  const handleAnalysis = async () => {
    if (!examplePost.trim()) return;
    
    // 새 분석 시작 시 이전 상태 초기화
    setIsAnalyzing(true);
    setError('');
    setAnalysisResult('');
    setAnalysisComplete(false);
    setGeneratedContents({});
    
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze',
          examplePost: examplePost,
          temperature: 0.7
        }),
      });
      
      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API 응답이 유효한 JSON 형식이 아닙니다.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }
      
      setAnalysisResult(data.result);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('분석 오류:', error);
      setError(error.message || '분석 중 오류가 발생했습니다.');
      setAnalysisComplete(false);
      setPendingGeneration(false); // 에러 발생 시 대기 중인 생성 요청 취소
    } finally {
      setIsAnalyzing(false);
      
      // 분석이 완료되고 대기 중인 생성 요청이 있으면 생성 시작
      if (pendingGeneration && userContent.trim() && analysisComplete) {
        setPendingGeneration(false);
        handleGenerateMultiple();
      }
    }
  };

  const handleGenerateMultiple = async () => {
    // 분석 중이면 대기 상태로 설정하고 리턴
    if (isAnalyzing) {
      setPendingGeneration(true);
      return;
    }
    
    if (!userContent.trim() || !analysisComplete) return;
    
    setIsGenerating(true);
    setError('');
    setGeneratedContents({});
    
    try {
      // 여러 Temperature 값에 대해 병렬로 API 호출
      const requests = temperatureValues.map(temp => 
        fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate',
            examplePost: examplePost,
            userContent: userContent,
            analysisResult: analysisResult,
            temperature: temp
          }),
        })
        .then(async response => {
          // 응답이 JSON인지 확인
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Invalid JSON response:', text.substring(0, 100));
            throw new Error(`API 응답이 유효한 JSON 형식이 아닙니다. (Temperature: ${temp})`);
          }
          
          return response.json();
        })
        .then(data => {
          if (data.error) throw new Error(`Temperature ${temp}: ${data.error}`);
          return { temp, result: data.result };
        })
        .catch(error => {
          console.error(`Temperature ${temp} 처리 중 오류:`, error);
          throw error;
        })
      );
      
      // 모든 요청 결과 기다리기 (일부 실패해도 계속 진행)
      const results = await Promise.allSettled(requests);
      
      // 성공한 결과만 모아서 객체로 변환
      const contents = {};
      let hasSuccessfulResult = false;
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          contents[result.value.temp] = result.value.result;
          hasSuccessfulResult = true;
        }
      });
      
      setGeneratedContents(contents);
      
      if (!hasSuccessfulResult) {
        throw new Error('모든 Temperature 값에 대한 생성이 실패했습니다.');
      }
      
    } catch (error) {
      console.error('생성 오류:', error);
      setError(error.message || '생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.titleLeft}>예시 기반 콘텐츠 생성기, Plait</h1>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.section}>
          <label className={styles.label}>
            <span className={styles.labelBox}>Input</span> 예시 입력하기
          </label>
          <textarea 
            className={styles.textarea}
            value={examplePost}
            onChange={(e) => setExamplePost(e.target.value)}
            placeholder="예시 게시글을 입력하세요..."
            disabled={isAnalyzing}
          />
          <div className={styles.buttonContainer}>
            <button 
              className={styles.button}
              onClick={handleAnalysis}
              disabled={isAnalyzing || !examplePost.trim()}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analysis'}
            </button>
          </div>
        </div>
        
        <div className={`${styles.section} ${!analysisComplete && !isAnalyzing ? styles.disabled : ''}`}>
          <label className={styles.label}>
            <span className={styles.labelBox}>Input</span> 콘텐츠 입력
          </label>
          <textarea 
            className={styles.textarea}
            value={userContent}
            onChange={(e) => setUserContent(e.target.value)}
            placeholder="변환할 내용을 입력하세요..."
            disabled={isGenerating}
          />
          <div className={styles.buttonContainer}>
            <button 
              className={styles.button}
              onClick={handleGenerateMultiple}
              disabled={(!analysisComplete && !isAnalyzing) || !userContent.trim() || isGenerating || pendingGeneration}
            >
              {isGenerating ? 'Generating...' : pendingGeneration ? 'Waiting for analysis...' : 'Generate'}
            </button>
          </div>
        </div>
        
        {Object.keys(generatedContents).length > 0 && (
          <div className={styles.section}>
            <label className={styles.label}>
              <span className={styles.labelBox}>Output</span> 콘텐츠 생성 결과
            </label>
            {temperatureValues.map((temp, index) => (
              <div key={temp} className={styles.outputContainer} style={{marginBottom: index < temperatureValues.length - 1 ? '15px' : '0'}}>
                {generatedContents[temp] ? (
                  <div className={styles.generatedText}>{generatedContents[temp]}</div>
                ) : (
                  <div className={styles.placeholder}>생성 실패 또는 진행 중</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 