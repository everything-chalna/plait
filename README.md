# Plait 프로젝트
- 예시를 입력하면 예시를 분석해서 이와 유사한 형태의 포스트를 생성하는 서비스
- 다양한 Temperature 값으로 여러 버전의 콘텐츠를 동시에 생성하여 비교 가능

## User Flow
- 예시 게시글 입력하기
- 예시 게시글을 분석하는 AI
- User Content 입력하면 예시 게시글 형태로 여러 버전의 글 생성 (Temperature 0-2.0)
- 분석 중에도 User Content 입력 가능 (분석 완료 후 자동 생성)

## UI
- 예시 게시글 입력 박스
    - 예시 게시글 분석(Analysis) 버튼
- 유저 콘텐츠 입력 박스
    - AI 콘텐츠 생성(Generate) 버튼
- AI 생성 콘텐츠 박스
    - 5개의 다른 Temperature 값(0, 0.5, 1.0, 1.5, 2.0)으로 생성된 결과 표시
    - Temperature가 높을수록 더 창의적이고 다양한 결과 생성

## Temperature란?
Temperature는 AI 모델의 출력 다양성을 조절하는 값입니다:
- 낮은 값(0에 가까울수록): 예측 가능하고 일관된 출력 생성
- 높은 값(2.0에 가까울수록): 더 다양하고 창의적인 출력 생성
- Plait에서는 5단계의 다양한 Temperature 값으로 결과를 비교할 수 있습니다

## 개발환경
- Vercel을 이용하여 배포
- Front: React + Next.js
- API: Next.js API Routes + Gemini 2.0 Flash

## 시작하기

프로젝트를 시작하려면:

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 시작
npm run start
```

## 기술 스택
- React
- Next.js
- Vercel
- Gemini 2.0 Flash API

## 최근 업데이트
- 다양한 Temperature 값(0, 0.5, 1.0, 1.5, 2.0)으로 콘텐츠 동시 생성 기능 추가
- 분석 중에도 콘텐츠 입력 가능 및 분석 완료 후 자동 생성 기능
- API 응답 형식 검증 및 오류 처리 개선
- Next.js 구조 최적화