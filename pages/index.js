import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [examplePost, setExamplePost] = useState('');
  const [userContent, setUserContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    if (!examplePost.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze',
          examplePost: examplePost
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }
      
      setAnalysisResult(data.result);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('분석 오류:', error);
      setError(error.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!userContent.trim() || !analysisComplete) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          examplePost: examplePost,
          userContent: userContent,
          analysisResult: analysisResult
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '생성 중 오류가 발생했습니다.');
      }
      
      setGeneratedContent(data.result);
    } catch (error) {
      console.error('생성 오류:', error);
      setError(error.message || '생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Plait</h1>
        <p className={styles.subtitle}>예시를 기반으로 맞춤형 콘텐츠를 생성하세요</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>1. 예시 게시글 입력</h2>
            <p className={styles.description}>
              AI가 분석할 예시 게시글을 입력하세요. 스타일, 구조, 톤이 분석됩니다.
            </p>
            <textarea 
              className={styles.textarea}
              value={examplePost}
              onChange={(e) => setExamplePost(e.target.value)}
              placeholder="예시 게시글을 입력하세요..."
              disabled={isAnalyzing || analysisComplete}
            />
            <button 
              className={`${styles.button} ${styles.analyzeButton}`}
              onClick={handleAnalysis}
              disabled={isAnalyzing || !examplePost.trim() || analysisComplete}
            >
              {isAnalyzing ? '분석 중...' : analysisComplete ? '분석 완료' : '예시 게시글 분석 (Analysis)'}
            </button>
          </div>

          <div className={`${styles.card} ${!analysisComplete ? styles.disabled : ''}`}>
            <h2 className={styles.cardTitle}>2. 유저 콘텐츠 입력</h2>
            <p className={styles.description}>
              변환하고 싶은 내용을 입력하세요. 예시 게시글 스타일로 변환됩니다.
            </p>
            <textarea 
              className={styles.textarea}
              value={userContent}
              onChange={(e) => setUserContent(e.target.value)}
              placeholder="변환할 내용을 입력하세요..."
              disabled={!analysisComplete || isGenerating}
            />
            <button 
              className={`${styles.button} ${styles.generateButton}`}
              onClick={handleGenerate}
              disabled={!analysisComplete || !userContent.trim() || isGenerating}
            >
              {isGenerating ? '생성 중...' : 'AI 콘텐츠 생성 (Generate)'}
            </button>
          </div>

          <div className={`${styles.card} ${styles.resultCard} ${!generatedContent ? styles.disabled : ''}`}>
            <h2 className={styles.cardTitle}>3. AI 생성 콘텐츠</h2>
            <p className={styles.description}>
              예시 게시글의 스타일을 적용한 생성 결과입니다.
            </p>
            <div className={styles.resultContent}>
              {generatedContent ? (
                <pre className={styles.generatedText}>{generatedContent}</pre>
              ) : (
                <p className={styles.placeholder}>콘텐츠가 생성되면 이곳에 표시됩니다.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 