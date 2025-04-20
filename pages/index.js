import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState('input_output');
  const [examples, setExamples] = useState([{ id: 1 }]);

  const addExample = () => {
    const newId = examples.length > 0 ? Math.max(...examples.map(ex => ex.id)) + 1 : 1;
    setExamples([...examples, { id: newId }]);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>예시 제공</h1>
          
          <p className={styles.description}>
            당신의 예시의 목소리, 톤, 스타일, 구조를 학습합니다. 
            <button className={styles.readMore}>더 읽기</button>
          </p>
          
          {examples.map((example, index) => (
            <div key={example.id} className={styles.exampleSection}>
              <h2 className={styles.exampleTitle}>예시 {index + 1}</h2>
              
              <div className={styles.optionContainer}>
                <label className={styles.optionLabel}>
                  <input
                    type="radio"
                    name={`option-${example.id}`}
                    value="input_output"
                    checked={selectedOption === 'input_output'}
                    onChange={() => setSelectedOption('input_output')}
                    className={styles.radioInput}
                  />
                  <span>입력 및 출력</span>
                </label>
                
                <label className={styles.optionLabel}>
                  <input
                    type="radio"
                    name={`option-${example.id}`}
                    value="output_only"
                    checked={selectedOption === 'output_only'}
                    onChange={() => setSelectedOption('output_only')}
                    className={styles.radioInput}
                  />
                  <span>출력만</span>
                </label>
              </div>
              
              <div className={styles.inputSection}>
                <h3 className={styles.inputTitle}>입력 예시</h3>
                <textarea
                  className={styles.textArea}
                  placeholder="여기에 입력 예시를 넣으세요"
                />
              </div>
              
              <div className={styles.inputSection}>
                <h3 className={styles.inputTitle}>출력 예시</h3>
                <textarea
                  className={styles.textArea}
                  placeholder="여기에 출력 예시를 넣으세요"
                />
              </div>
            </div>
          ))}
          
          <button className={styles.addButton} onClick={addExample}>
            + 예시 추가
          </button>
          
          <div className={styles.buttonContainer}>
            <button className={styles.backButton}>
              ← 뒤로 가기
            </button>
            <button className={styles.extractButton}>
              패턴 추출 →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 