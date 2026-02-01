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
- **즉시 저장**: AI가 콘텐츠를 생성하면 즉시 DB에 저장 및 공개

### 🎴 카드뉴스 뷰어
- **3D 슬라이드 효과**: 카드가 좌우로 넘어가는 화려한 애니메이션
- **다양한 배경색**: 슬라이드마다 다른 그라데이션 배경
- **터치/클릭 네비게이션**: 좌우 버튼 또는 하단 점 클릭으로 이동
- **상세 아티클 연결**: 슬라이드 클릭 시 상세 아티클로 이동

### 🔍 검색 및 필터링
- **실시간 검색**: 제목 또는 태그로 콘텐츠 검색
- **태그 필터링**: 태그 클릭으로 관련 콘텐츠만 보기
- **무한 스크롤**: 스크롤 시 자동으로 더 많은 콘텐츠 로드

### 🛡️ Admin 콘텐츠 관리 시스템

메인 페이지 우측 상단 톱니바퀴(⚙️) 아이콘을 클릭하여 Admin 패널에 접근할 수 있습니다.

#### 📊 대시보드 (`/admin`)
- **통계 현황**: 전체 콘텐츠 수, 남은 생성 횟수, 태그 수, DB 연결 상태
- **남은 생성 횟수**: 오늘 남은 콘텐츠 생성 가능 횟수 표시 (한도 초과 시 회색으로 변경)
- **빠른 실행**: 새 콘텐츠 생성, 콘텐츠 관리, 태그 관리로 빠른 이동
- **최근 콘텐츠**: 최근 생성된 5개 콘텐츠 목록

#### 📋 콘텐츠 관리 (`/admin/contents`)
- **테이블 형태 목록**: 제목, 카테고리, 태그, 생성일 표시
- **검색**: 제목 또는 태그로 콘텐츠 검색
- **일괄 선택/삭제**: 체크박스로 여러 콘텐츠 선택 후 일괄 삭제
- **페이지네이션**: 대량의 콘텐츠도 쉽게 탐색

#### 👁️ 콘텐츠 상세 (`/admin/contents/[id]`)
- **콘텐츠 정보 조회**: 제목, 카테고리, 태그 확인
- **슬라이드 미리보기**: 생성된 카드 슬라이드 전체 확인
- **원본 정보 확인**: 원본 URL 또는 텍스트 확인
- **바로가기**: 카드뉴스 보기, 아티클 보기 링크
- **삭제**: 콘텐츠 삭제 기능

#### 🏷️ 태그 관리 (`/admin/tags`)
- **태그 생성**: 새 태그 추가 (90% 이상 유사 태그 자동 재활용)
- **태그 수정**: 기존 태그 이름 변경
- **태그 삭제**: 사용되지 않는 태그 정리
- **사용 현황**: 각 태그가 연결된 콘텐츠 수 표시

#### 🔄 스마트 태그 재활용
AI가 콘텐츠 생성 시 태그를 자동 생성할 때, 기존 태그와 90% 이상 유사한 태그가 있으면 새로 생성하지 않고 기존 태그를 재활용합니다.
- Levenshtein Distance 알고리즘 기반 유사도 계산
- 태그 중복 방지 및 일관성 유지

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

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── admin/              # Admin API
│   │   │   ├── contents/       # 콘텐츠 관리 API (조회, 일괄삭제)
│   │   │   ├── stats/          # 대시보드 통계 API
│   │   │   └── tags/           # 태그 관리 API
│   │   ├── contents/           # 콘텐츠 조회/삭제 API
│   │   ├── generate/           # AI 생성 API (즉시 저장)
│   │   ├── limit/              # 일일 등록 제한 체크 API
│   │   └── tags/               # 태그 조회 API
│   ├── admin/
│   │   ├── layout.tsx          # Admin 레이아웃 (사이드바)
│   │   ├── page.tsx            # 대시보드
│   │   ├── contents/
│   │   │   ├── page.tsx        # 콘텐츠 목록 관리
│   │   │   └── [id]/page.tsx   # 콘텐츠 상세 보기
│   │   ├── tags/page.tsx       # 태그 관리
│   │   └── create/page.tsx     # 새 콘텐츠 생성
│   ├── [id]/
│   │   ├── page.tsx            # 카드뉴스 슬라이드 뷰어
│   │   └── article/page.tsx    # 상세 아티클 페이지
│   ├── create/page.tsx         # 콘텐츠 생성 페이지 (일반)
│   ├── page.tsx                # 메인 목록 페이지
│   └── globals.css             # 전역 스타일
├── components/
│   └── ToastProvider.tsx       # 토스트 알림 컴포넌트
├── lib/
│   ├── db.ts                   # Prisma 클라이언트
│   └── tagUtils.ts             # 태그 유사도 검사 유틸리티
└── types.ts                    # TypeScript 타입 정의
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
  status        String   @default("PUBLISHED")
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

- **일일 등록 제한**: 하루 최대 3개 (한국 시간 기준, 자정에 리셋)
- AI 토큰 비용 절약을 위해 등록 수가 제한됩니다.
- 대시보드에서 남은 생성 횟수를 실시간으로 확인할 수 있습니다.

## 📄 라이선스

MIT License

---

Made with ❤️ using Upstage Solar Pro AI
