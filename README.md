# 다정이 블로그 생성기

감성 넘치는 네이버 블로그 글을 AI가 자동으로 생성해주는 모바일 최적화 PWA입니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **AI**: Google Gemini 1.5 Flash
- **데이터 저장**: Google Sheets API
- **폰트**: NanumSquare

## 시작하기

### 1. 환경변수 설정

`.env.local.example`을 복사하여 `.env.local`을 생성하고 값을 입력합니다.

```bash
cp .env.local.example .env.local
```

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/)에서 발급 |
| `GOOGLE_SHEET_ID` | 구글 시트 URL의 `/d/[ID]/edit` 부분 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Cloud 서비스 계정 이메일 |
| `GOOGLE_PRIVATE_KEY` | 서비스 계정 JSON 키의 `private_key` 값 |

### 2. Google Sheets 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트 생성
2. **Google Sheets API** 활성화
3. **서비스 계정** 생성 후 JSON 키 다운로드
4. 대상 구글 시트에 서비스 계정 이메일을 **편집자**로 공유
5. 시트의 첫 행에 헤더 추가 (선택):
   - A: 날짜 | B: 주제 | C: 기본정보 | D: 경험/느낌 | E: 생성된 본문

### 3. 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 4. Vercel 배포

```bash
# Vercel CLI 사용 시
npx vercel

# 또는 GitHub 연동 후 Vercel 대시보드에서 배포
```

Vercel 환경변수 설정:
- Dashboard → Project → Settings → Environment Variables에 `.env.local`의 값들 추가
- `GOOGLE_PRIVATE_KEY`는 따옴표 없이, `\n`을 실제 줄바꿈으로 입력

## 사용법

1. **주제/장소 이름** 입력 (필수)
2. **기본 정보** 입력: 영업시간, 주소, 주차 등
3. **경험/느낌 메모** 입력: 방문 당시 느낀 점, 주문한 메뉴 등
4. **"다정이 감성으로 1500자 글쓰기 ✨"** 버튼 클릭
5. 생성된 글 확인 후 **복사하기** 버튼으로 클립보드에 복사

## PWA 설치

모바일 브라우저에서 접속 후:
- **iOS Safari**: 공유 버튼 → "홈 화면에 추가"
- **Android Chrome**: 주소창 우측 메뉴 → "앱 설치" 또는 "홈 화면에 추가"
