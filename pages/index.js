import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [examplePost, setExamplePost] = useState('');
  const [userContent, setUserContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleAnalysis = () => {
    if (!examplePost.trim()) return;
    
    setIsAnalyzing(true);
    
    // 실제로는 여기서 API 호출을 통해 분석을 수행합니다
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const handleGenerate = () => {
    if (!userContent.trim() || !analysisComplete) return;
    
    setIsGenerating(true);
    
    // 실제로는 여기서 API 호출을 통해 콘텐츠를 생성합니다
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedContent(
        `${userContent}\n\n이 내용을 바탕으로 예시 게시글 스타일로 변환된 콘텐츠입니다.\n\n분석된 예시 게시글의 스타일과 구조를 반영하여 생성되었습니다.`
      );
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Plait</h1>
        <p className={styles.subtitle}>예시를 기반으로 맞춤형 콘텐츠를 생성하세요</p>
        
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