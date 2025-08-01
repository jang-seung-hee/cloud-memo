# Cloud Memo 개발 가이드라인

## 프로젝트 개요

### 목적
- **Cloud Memo**: "10초 기록, 3초 검색" 컨셉의 실용적 메모 앱
- 누구나 빠르게 메모를 남기고, 사진 첨부하며, 원하는 정보를 쉽게 기록/검색
- 기록의 진입장벽 극단적 낮춤 (복잡한 가입/로그인, 태그, 폴더 없음)

### 기술 스택
- **프론트엔드**: React 19.1.0 + TypeScript 4.9.5
- **스타일링**: TailwindCSS 3.4.17
- **라우팅**: React Router DOM 7.7.0
- **아이콘**: Lucide React
- **스토리지**: 1차 LocalStorage, 2차 Firebase Firestore
- **호스팅**: Netlify

## 아키텍처 표준

### 폴더 구조
```
src/
├── components/           # 재사용 가능한 컴포넌트
│   ├── ui/              # 기본 UI 컴포넌트
│   ├── memo/            # 메모 관련 컴포넌트
│   └── layout/          # 레이아웃 컴포넌트
├── pages/               # 페이지 컴포넌트
├── hooks/               # 커스텀 훅
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
├── services/            # API/스토리지 서비스
└── styles/              # 전역 스타일
```

### 모듈 분할 원칙
- **컴포넌트**: 기능별로 분리, 단일 책임 원칙
- **페이지**: 라우트별로 분리
- **서비스**: 스토리지, API 로직 분리
- **타입**: 공통 타입은 types/ 폴더에 정의
- **분량**: 한 파일의 코드길이가 300라인 이상이면 리팩토링 할 것

## 디자인 시스템

### **⚠️ 필수 디자인 규칙**
- **반드시 .design 폴더의 스타일을 모방할 것**
- **독창적 디자인 금지, 기존 색감과 스타일 활용**

### 색상 시스템
- **Primary**: 파란색 계열 (#87ceeb ~ #4682b4)
- **Secondary**: 연한 파란색 계열 (#f0f8ff ~ #b0e0e6)
- **Text**: 흰색 및 회색 계열

### **📱 하단 탭 네비게이션 (공통 컴포넌트)**
- **위치**: Header 컴포넌트 내에 포함되어 모든 페이지에서 공통 사용
- **표시 조건**: 모바일에서만 표시 (`md:hidden`)
- **탭 구성**:
  - 메모 목록 (FileText 아이콘) → `/` 경로
  - 상용구 관리 (Copy 아이콘) → `/templates` 경로
- **활성 상태**: 현재 경로에 따라 자동 활성화
- **스타일**: 파란색 계열 활성화, 회색 비활성화
- **페이지 여백**: 모든 페이지에 `pb-20` 클래스 추가하여 하단 탭이 콘텐츠를 가리지 않도록 함

### **🎯 레이아웃 규칙**
- **Header**: 상단 고정 헤더 + 하단 탭 네비게이션 (모바일)
- **Main Content**: `pb-20` 하단 여백 필수
- **반응형**: 데스크톱에서는 하단 탭 숨김

## 컴포넌트 표준

### **📋 필수 컴포넌트 구조**
- **Header**: 로고, 네비게이션, 하단 탭 포함
- **BottomTabBar**: 메모 목록 ↔ 상용구 관리 전환
- **페이지별 여백**: 하단 탭 공간 확보

### **🔗 라우팅 규칙**
- `/`: 메모 목록 페이지
- `/write`: 메모 작성 페이지  
- `/templates`: 상용구 관리 페이지
- `/memo/:id`: 메모 상세 페이지

## 코드 품질 기준

### **📝 코딩 스타일**
- **TypeScript**: 엄격한 타입 체크 필수
- **함수형 컴포넌트**: React Hooks 사용
- **명명 규칙**: camelCase (변수/함수), PascalCase (컴포넌트)
- **주석**: 복잡한 로직에 한글 주석 필수

### **🎨 스타일링 원칙**
- **TailwindCSS**: 유틸리티 클래스 우선 사용
- **반응형**: mobile-first 접근법
- **일관성**: 색상, 간격, 폰트 크기 통일
- **접근성**: 적절한 색상 대비, 키보드 네비게이션

## 성능 최적화

### **⚡ 성능 기준**
- **번들 크기**: 500KB 이하 유지
- **로딩 시간**: 초기 로딩 3초 이내
- **메모리 사용**: 불필요한 리렌더링 방지
- **이미지 최적화**: WebP 포맷, 적절한 압축

### **🔧 최적화 기법**
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 계산 비용이 큰 연산 최적화
- **Lazy Loading**: 코드 스플리팅 적용
- **이미지 지연 로딩**: Intersection Observer 활용

## 테스트 전략

### **🧪 테스트 범위**
- **단위 테스트**: 유틸리티 함수, 커스텀 훅
- **컴포넌트 테스트**: 주요 UI 컴포넌트
- **통합 테스트**: 페이지 간 네비게이션
- **E2E 테스트**: 사용자 시나리오

### **📊 테스트 커버리지**
- **목표**: 80% 이상 유지
- **중요도**: 비즈니스 로직 > UI 컴포넌트 > 유틸리티

## 배포 및 운영

### **🚀 배포 프로세스**
- **브랜치 전략**: main, develop, feature 브랜치
- **CI/CD**: GitHub Actions 활용
- **환경**: 개발 → 스테이징 → 프로덕션
- **모니터링**: 에러 추적, 성능 모니터링

### **📱 호스팅 환경**
- **Netlify**: 정적 사이트 호스팅
- **도메인**: whimsical-raindrop-cf7019.netlify.app
- **SSL**: 자동 HTTPS 적용
- **CDN**: 글로벌 엣지 네트워크

## 개발 워크플로우

### **🔄 개발 프로세스**
1. **기능 분석**: 요구사항 명확화
2. **디자인 검토**: .design 폴더 스타일 참조
3. **컴포넌트 설계**: 재사용성 고려
4. **구현**: TypeScript + TailwindCSS
5. **테스트**: 단위/통합 테스트
6. **리뷰**: 코드 품질 검토
7. **배포**: Netlify 자동 배포

### **📋 품질 체크리스트**
- [ ] TypeScript 타입 오류 없음
- [ ] 반응형 디자인 적용
- [ ] 접근성 기준 준수
- [ ] 성능 최적화 적용
- [ ] 테스트 커버리지 달성
- [ ] 코드 리뷰 완료

## 문제 해결 가이드

### **🐛 일반적인 이슈**
- **타입 오류**: 인터페이스 정의 확인
- **스타일 문제**: TailwindCSS 클래스 검증
- **라우팅 오류**: 경로 설정 확인
- **성능 이슈**: React DevTools 프로파일링

### **🔧 디버깅 도구**
- **React DevTools**: 컴포넌트 상태 확인
- **Chrome DevTools**: 네트워크, 성능 분석
- **TypeScript**: 타입 체크 및 자동완성
- **ESLint**: 코드 품질 검사

---

**⚠️ 중요**: 이 가이드라인을 엄격히 준수하여 일관성 있는 개발을 유지하세요. 