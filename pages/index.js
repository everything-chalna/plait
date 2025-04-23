import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [examplePosts, setExamplePosts] = useState(['']);
  const [userContent, setUserContent] = useState('');
  const [generatedContents, setGeneratedContents] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState('');
  const [pendingGeneration, setPendingGeneration] = useState(false);
  const temperatureValues = [0, 0.5, 1.0, 1.5, 2.0];

  const addExampleInput = () => {
    if (examplePosts.length < 5) {
      setExamplePosts([...examplePosts, '']);
    }
  };

  const removeExampleInput = (index) => {
    if (examplePosts.length > 1) {
      const updatedExamples = [...examplePosts];
      updatedExamples.splice(index, 1);
      setExamplePosts(updatedExamples);
    }
  };

  const handleExampleChange = (index, value) => {
    const updatedExamples = [...examplePosts];
    updatedExamples[index] = value;
    setExamplePosts(updatedExamples);
  };

  const handleAnalysis = async () => {
    const hasValidExamples = examplePosts.some(post => post.trim() !== '');
    if (!hasValidExamples) return;
    
    setIsAnalyzing(true);
    setError('');
    setAnalysisResult('');
    setAnalysisComplete(false);
    setGeneratedContents({});
    
    try {
      const validExamples = examplePosts.filter(post => post.trim() !== '');
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze',
          examplePosts: validExamples,
          temperature: 0.7
        }),
      });
      
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
      setPendingGeneration(false);
    } finally {
      setIsAnalyzing(false);
      
      if (pendingGeneration && userContent.trim() && analysisComplete) {
        setPendingGeneration(false);
        handleGenerateMultiple();
      }
    }
  };

  const handleGenerateMultiple = async () => {
    if (isAnalyzing) {
      setPendingGeneration(true);
      return;
    }
    
    if (!userContent.trim() || !analysisComplete) return;
    
    setIsGenerating(true);
    setError('');
    setGeneratedContents({});
    
    try {
      const validExamples = examplePosts.filter(post => post.trim() !== '');
      
      const requests = temperatureValues.map(temp => 
        fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate',
            examplePosts: validExamples,
            userContent: userContent,
            analysisResult: analysisResult,
            temperature: temp
          }),
        })
        .then(async response => {
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
      
      const results = await Promise.allSettled(requests);
      
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
            <span className={styles.labelBox}>Input</span> 예시 입력하기 (최대 5개)
          </label>
          {examplePosts.map((example, index) => (
            <div key={index} className={styles.exampleContainer}>
              <textarea 
                className={styles.textarea}
                value={example}
                onChange={(e) => handleExampleChange(index, e.target.value)}
                placeholder={`예시 게시글 ${index + 1}을 입력하세요...`}
                disabled={isAnalyzing}
              />
              <div className={styles.exampleButtonContainer}>
                {index > 0 && (
                  <button 
                    className={`${styles.iconButton} ${styles.removeButton}`}
                    onClick={() => removeExampleInput(index)}
                    disabled={isAnalyzing}
                    title="예시 삭제"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className={styles.buttonContainer}>
            {examplePosts.length < 5 && (
              <button 
                className={`${styles.button} ${styles.addExampleButton}`}
                onClick={addExampleInput}
                disabled={isAnalyzing}
                title="예시 추가"
              >
                + Add example
              </button>
            )}
            <button 
              className={styles.button}
              onClick={handleAnalysis}
              disabled={isAnalyzing || !examplePosts.some(post => post.trim() !== '')}
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
                <div className={styles.temperatureLabel}>Temperature: {temp}</div>
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