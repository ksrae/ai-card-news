# AI Card News 📰

AI 기반 카드뉴스 & 블로그 아티클 자동 생성 서비스입니다.
긴 텍스트나 URL을 입력하면 Upstage Solar Pro AI가 자동으로 카드뉴스 슬라이드와 상세 블로그 아티클을 생성합니다.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan)

## ✨ 주요 기능

### 📝 콘텐츠 생성
- **텍스트 입력**: 긴 텍스트를 붙여넣으면 자동 요약
- **URL 입력**: 웹페이지 URL을 입력하면 내용 분석 후 요약
- **카드뉴스 생성**: 5~7장의 슬라이드 카드 자동 생성
- **블로그 아티클**: 상세한 블로그 형식의 아티클 동시 생성

### 🎴 카드뉴스 뷰어
- **3D 슬라이드 효과**: 카드가 좌우로 넘어가는 화려한 애니메이션
- **다양한 배경색**: 슬라이드마다 다른 그라데이션 배경
- **터치/클릭 네비게이션**: 좌우 버튼 또는 하단 점 클릭으로 이동
- **상세 아티클 연결**: 슬라이드 클릭 시 상세 아티클로 이동

### 🔍 검색 및 필터링
- **실시간 검색**: 제목 또는 태그로 콘텐츠 검색
- **태그 필터링**: 태그 클릭으로 관련 콘텐츠만 보기
- **무한 스크롤**: 스크롤 시 자동으로 더 많은 콘텐츠 로드

### 🗑️ 콘텐츠 관리
- **삭제 기능**: 메인 목록 및 상세 페이지에서 삭제 가능
- **일일 등록 제한**: 하루 최대 3개 등록 (AI 토큰 비용 절약)

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|-----|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS 4 |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma 6 |
| **AI** | Upstage Solar Pro |
| **Icons** | Lucide React |

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Supabase PostgreSQL 연결
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Upstage API Key
UPSTAGE_API_KEY="up_..."
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma generate
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🚀 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 GitHub 저장소 연결
3. 환경 변수 설정:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `UPSTAGE_API_KEY`
4. Deploy!

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── contents/       # 콘텐츠 CRUD API
│   │   ├── generate/       # AI 생성 API
│   │   ├── limit/          # 일일 등록 제한 체크 API
│   │   └── tags/           # 태그 조회 API
│   ├── [id]/
│   │   ├── page.tsx        # 카드뉴스 슬라이드 뷰어
│   │   └── article/page.tsx # 상세 아티클 페이지
│   ├── create/page.tsx     # 콘텐츠 생성 페이지
│   ├── page.tsx            # 메인 목록 페이지
│   └── globals.css         # 전역 스타일
├── components/
│   └── ToastProvider.tsx   # 토스트 알림 컴포넌트
├── lib/
│   └── db.ts               # Prisma 클라이언트
└── types.ts                # TypeScript 타입 정의
```

## 📊 데이터베이스 스키마

```prisma
model Contents {
  id            String   @id @default(uuid())
  title         String
  original_url  String?
  raw_text      String?
  full_article  Json?
  thumbnail_url String?
  category      String?
  status        String   @default("DRAFT")
  created_at    DateTime @default(now())
  card_slides   CardSlides[]
  tags          ContentTags[]
}

model CardSlides {
  id          String   @id @default(uuid())
  content_id  String
  slide_order Int
  headline    String
  description String
  image_url   String?
}

model Tags {
  id         String   @id @default(uuid())
  name       String   @unique
  created_at DateTime @default(now())
  contents   ContentTags[]
}
```

## ⚠️ 제한 사항

- **일일 등록 제한**: 하루 최대 3개 (한국 시간 기준)
- AI 토큰 비용 절약을 위해 등록 수가 제한됩니다.

## 📄 라이선스

MIT License

---

Made with ❤️ using Upstage Solar Pro AI
