import React, { useState } from 'react';
import styles from '../styles/SimpleUI.module.css';

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
      <div className={styles.card}>
        <h1 className={styles.title}>예시 기반 콘텐츠 생성기, Plait</h1>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.section}>
          <label className={styles.label}>
            <span className={styles.labelText}>Input</span> 예시 입력하기
          </label>
          <textarea 
            className={styles.textarea}
            value={examplePost}
            onChange={(e) => setExamplePost(e.target.value)}
            placeholder="예시 게시글을 입력하세요..."
            disabled={isAnalyzing || analysisComplete}
          />
          <div className={styles.buttonContainer}>
            <button 
              className={styles.button}
              onClick={handleAnalysis}
              disabled={isAnalyzing || !examplePost.trim() || analysisComplete}
            >
              {isAnalyzing ? '분석 중...' : 'Analysis'}
            </button>
          </div>
        </div>
        
        <div className={`${styles.section} ${!analysisComplete ? styles.disabled : ''}`}>
          <label className={styles.label}>
            <span className={styles.labelText}>Input</span> 콘텐츠 입력
          </label>
          <textarea 
            className={styles.textarea}
            value={userContent}
            onChange={(e) => setUserContent(e.target.value)}
            placeholder="변환할 내용을 입력하세요..."
            disabled={!analysisComplete || isGenerating}
          />
          <div className={styles.buttonContainer}>
            <button 
              className={styles.button}
              onClick={handleGenerate}
              disabled={!analysisComplete || !userContent.trim() || isGenerating}
            >
              {isGenerating ? '생성 중...' : 'Generate'}
            </button>
          </div>
        </div>
        
        <div className={`${styles.section} ${!generatedContent ? styles.disabled : ''}`}>
          <label className={styles.label}>
            <span className={styles.labelText}>Output</span> 생성 결과
          </label>
          <div className={styles.outputContainer}>
            {generatedContent ? (
              <div className={styles.generatedText}>{generatedContent}</div>
            ) : (
              <div className={styles.placeholder}>생성된 콘텐츠가 여기에 표시됩니다</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 