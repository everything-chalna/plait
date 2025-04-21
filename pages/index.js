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
  const [temperature, setTemperature] = useState(0.7);

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
          examplePost: examplePost,
          temperature: temperature
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
          analysisResult: analysisResult,
          temperature: temperature
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
        <h1 className={styles.titleLeft}>예시 기반 콘텐츠 생성기, Plait</h1>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.settings}>
          <label className={styles.settingLabel}>
            Temperature: {temperature}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.settingHint}>
              낮음 (정확함) ↔ 높음 (창의적)
            </span>
          </label>
        </div>
        
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
        
        <div className={`${styles.section} ${!analysisComplete ? styles.disabled : ''}`}>
          <label className={styles.label}>
            <span className={styles.labelBox}>Input</span> 콘텐츠 입력
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
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
        
        <div className={`${styles.section} ${!generatedContent ? styles.disabled : ''}`}>
          <label className={styles.label}>
            <span className={styles.labelBox}>Output</span> 생성 결과
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