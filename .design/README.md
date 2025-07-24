# BossDesk 디자인 시스템

이 폴더는 BossDesk 애플리케이션의 프론트엔드 디자인 요소들을 분리하여 저장한 디자인 시스템입니다.

## 📁 폴더 구조

```
.design/
├── styles/                    # CSS 스타일 파일들
│   ├── main.css              # 메인 스타일 (App.css)
│   ├── index.css             # 기본 스타일
│   └── components/           # 컴포넌트별 스타일
├── components/               # UI 컴포넌트들
│   ├── ui/                   # 재사용 가능한 UI 컴포넌트
│   │   ├── FormulaTooltip.js
│   │   ├── contract-common/  # 계약서 공통 컴포넌트
│   │   └── contract-debug/   # 디버그 컴포넌트
│   ├── pages/                # 페이지별 컴포넌트
│   │   └── contract-steps/   # 계약서 단계별 컴포넌트
│   └── layout/               # 레이아웃 컴포넌트
│       └── AppLayout.js      # 앱 라우팅 구조
├── pages/                    # 페이지 컴포넌트들
│   ├── home/                 # 홈 페이지
│   │   └── HomePage.js
│   ├── contract/             # 계약서 페이지
│   └── allowance/            # 수당 계산 페이지
│       └── AllowanceMenuPage.js
└── assets/                   # 이미지 및 아이콘
    ├── images/               # 이미지 파일들
    └── icons/                # 아이콘 파일들
        └── logo.svg
```

## 🎨 디자인 요소

### 색상 시스템
- **Primary**: 파란색 계열 (#87ceeb ~ #4682b4)
- **Secondary**: 연한 파란색 계열 (#f0f8ff ~ #b0e0e6)
- **Dark Mode**: 다크 테마 지원
- **Text**: 흰색 및 회색 계열

### 컴포넌트 스타일
- **버튼**: 그라데이션 배경, 호버 효과
- **폼 요소**: 둥근 모서리, 포커스 효과
- **카드**: 그림자 효과, 반응형 디자인
- **네비게이션**: 단계별 진행 표시

### 반응형 디자인
- **모바일**: 480px 이하
- **태블릿**: 768px 이하
- **데스크톱**: 768px 이상

## 📱 주요 페이지

### 1. 홈 페이지 (HomePage.js)
- 히어로 섹션
- 액션 버튼 (근로계약서, 수당계산)
- QR 코드
- 푸터

### 2. 수당 계산 메뉴 (AllowanceMenuPage.js)
- 계산 방식 선택 메뉴
- 3가지 옵션 (예산, 월급, 시급)

### 3. 계약서 단계별 컴포넌트
- 사업장 정보
- 근로자 정보
- 계약 기간
- 근무 조건
- 근로시간
- 임금 조건
- 수습기간
- 기타 사항
- 최종 확인

## 🔧 사용 방법

### 스타일 적용
```css
/* 메인 스타일 import */
@import './styles/main.css';
@import './styles/index.css';
```

### 컴포넌트 사용
```jsx
import HomePage from './pages/home/HomePage';
import AllowanceMenuPage from './pages/allowance/AllowanceMenuPage';
```

### 레이아웃 적용
```jsx
import AppLayout from './components/layout/AppLayout';
```

## 📋 분리된 요소들

### ✅ 분리 완료
- CSS 스타일 파일들
- UI 컴포넌트들 (FormulaTooltip, 계약서 단계별 컴포넌트)
- 페이지 컴포넌트들 (홈, 수당 메뉴)
- 이미지 및 아이콘 파일들
- 레이아웃 구조

### ⚠️ 분리 제외 (비즈니스 로직 포함)
- ContractForm.js (폼 상태 관리, 검증 로직)
- ContractPreview.js (계약서 생성 로직)
- AllowanceCalculator.js (수당 계산 로직)

## 🎯 디자인 원칙

1. **일관성**: 모든 컴포넌트에서 동일한 디자인 언어 사용
2. **접근성**: 다크 모드 지원, 반응형 디자인
3. **사용성**: 직관적인 UI/UX
4. **확장성**: 새로운 컴포넌트 추가 용이

## 📝 참고사항

- 이 디자인 시스템은 순수한 UI/UX 요소만 포함
- 비즈니스 로직이나 상태 관리는 제외
- 실제 사용 시에는 원본 프로젝트의 로직과 결합 필요 