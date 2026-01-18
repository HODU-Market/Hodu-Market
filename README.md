# HODU-Market (호두마켓)

> 고양이 물품 전문 온라인 쇼핑몰

---

## 목차

1. [프로젝트 소개](#프로젝트-소개)
2. [팀원 및 역할 분담](#팀원-및-역할-분담)
3. [WBS 추진일정](#wbs-추진일정)
4. [프로젝트 구조](#프로젝트-구조)
5. [공용 모듈 (Common)](#공용-모듈-common)
6. [주요 기능](#주요-기능)
7. [최적화 및 개선 작업](#최적화-및-개선-작업)
8. [에러 트래킹 및 품질 관리](#에러-트래킹-및-품질-관리)

---

## 프로젝트 소개

호두마켓은 구매자와 판매자를 연결하는 **고양이 물품 전문 온라인 쇼핑몰**입니다.

- **구매자**: 상품 검색, 장바구니, 주문 기능
- **판매자**: 상품 등록, 수정, 삭제, 재고 관리 기능

---

## 팀원 및 역할 분담

|      이름      |                        GitHub                        | 담당 파트                              |
| :------------: | :--------------------------------------------------: | :------------------------------------- |
|     정준서     |        [@HeyJunN](https://github.com/HeyJunN)        |             장바구니 페이지             |
|     김혜진     |     [@ohhu-code](https://github.com/ohhu-code)       |             상품 상세 페이지            |
|     손은애     | [@sonenae10-blip](https://github.com/sonenae10-blip) |               메인페이지                |
|     김재이     | [@wn5zdvnvkp-dev](https://github.com/wn5zdvnvkp-dev) |             로그인/회원가입             |

---

## WBS 추진일정

<img width="577.885 mm" height="567.544 mm" alt="WBS 추진일정" src="https://i.imgur.com/EWgbkTz.png" />

---

## 프로젝트 구조

본 프로젝트는 **MPA (Multi-Page Application)** 구조를 채택하여 각 페이지가 독립적인 HTML 파일로 구성됩니다.

<img width="1091" height="824" alt="image" src="https://github.com/user-attachments/assets/c73d60ea-59c7-4634-ac95-0a17814c58da" />


### MPA 구조 선택 이유

1. **학습 목적**: Vanilla JS 기반으로 프레임워크 없이 웹 개발 학습
2. **페이지 독립성**: 각 페이지가 독립적으로 동작하여 유지보수 용이
3. **SEO 친화적**: 각 페이지가 고유 URL을 가져 검색 엔진 최적화에 유리
4. **빠른 초기 로딩**: 필요한 페이지만 로드하여 초기 로딩 속도 향상

---

## 공용 모듈 (Common)

### common.css

전체 사이트에서 공통으로 사용되는 스타일을 분리하여 **일관성 있는 UI**와 **코드 재사용성**을 확보했습니다.

```css
/* CSS Variables - 디자인 토큰 */
:root {
  --color-primary: #e3c1a4; /* 메인 컬러 (갈색) */
  --color-secondary: #3e3f3c; /* 보조 컬러 (어두운 회색) */
  --color-point: #eb5757; /* 포인트 컬러 (빨간색) */
  --font-family: "SpoqaHanSansNeo", "Noto Sans KR", sans-serif;
}
```

**포함 내용:**
| 구분 | 설명 |
|-----|------|
| 폰트 설정 | SpoqaHanSansNeo 웹폰트 로드 |
| CSS Variables | 색상, 폰트 등 디자인 토큰 |
| 기본 스타일 | body, a, button, input, img 등 |
| 유틸리티 클래스 | 자주 사용되는 스타일 모음 |
| 공통 컴포넌트 | 검색바, 수량 조절, 드롭다운 등 |

### common.js

모든 페이지에서 공통으로 필요한 JavaScript 기능을 모듈화했습니다.

```javascript
// 주요 기능
1. initQtyControl()      // 수량 조절 (+/-) 컴포넌트
2. loadHeader()          // 헤더 동적 로드
3. loadFooter()          // 푸터 동적 로드
4. toggleMyPageDropdown() // 마이페이지 드롭다운
5. logout()              // 로그아웃 처리
```

**동작 방식:**

```
[페이지 로드]
    │
    ├── fetch('/components/header.html')
    │       └── #header-snippet에 주입
    │
    ├── fetch('/components/footer.html')
    │       └── #footer-snippet에 주입
    │
    └── initQtyControl()
            └── .qty-control 요소에 이벤트 바인딩
```

### API 모듈 구조

```
assets/js/api/
├── config.js    # BASE_URL, 토큰 관리 (get/set/clear)
├── http.js      # fetch 래퍼, 에러 핸들링, 토큰 자동 갱신
├── auth.js      # login(), signup(), validateToken()
├── products.js  # getProducts(), getProduct(), createProduct()...
├── cart.api.js  # getCart(), addToCart(), updateCart(), deleteCart()
└── client.js    # API 클라이언트 (위 모듈 통합)
```

---

## 주요 기능

### 구매자 기능

- 회원가입 / 로그인
- 상품 목록 조회 및 검색
- 상품 상세 정보 확인
- 장바구니 담기 / 수량 조절 / 삭제

### 판매자 기능

- 판매자 회원가입 / 로그인
- 상품 등록

## VIEW

### 1. 로그인/회원가입

| 로그인 | 회원가입 |
| --- | --- |
| <img width="1897" height="862" alt="image" src="https://github.com/user-attachments/assets/dc706915-1797-4d75-9c24-02a3ff527dcc" /> | <img width="1919" height="864" alt="image" src="https://github.com/user-attachments/assets/fd278770-ee0c-4be3-91a7-701f7cd9e8bd" /> |

### 2. 메인페이지

<img width="1898" height="864" alt="image" src="https://github.com/user-attachments/assets/8e233b9e-0c3c-4fc9-b531-afeaa7ba065b" />

### 3. 제품 상세페이지

<img width="1897" height="864" alt="image" src="https://github.com/user-attachments/assets/99600ba4-9f45-458d-9cf9-15018cf0638e" />

### 4. 장바구니

<img width="1895" height="863" alt="image" src="https://github.com/user-attachments/assets/79b0a0e3-7b83-4109-91f0-4083c439a5e2" />

---

## 최적화 및 개선 작업

### 1. GitHub Pages 배포 최적화
- 서브 경로 지원을 위한 리소스 경로 수정
- 동적 경로 처리를 위한 `isRootPage` 로직 구현
- 모든 정적 리소스 경로를 상대 경로로 통일

### 2. 웹 접근성 개선 및 SEO 최적화
- **시맨틱 HTML**: `<main>`, `<nav>`, `<article>`, `<section>` 등 시맨틱 태그 사용
- **ARIA 속성**: 스크린 리더를 위한 aria-label, aria-describedby 추가
- **키보드 접근성**: 모든 인터랙티브 요소에 키보드 탐색 지원
- **Meta 태그**: OG 태그, Twitter Card 추가
- **Alt 텍스트**: 모든 이미지에 의미있는 대체 텍스트 제공

### 3. 코드 품질 개선
- **모듈화**: 모달 관련 로직을 Modal 클래스로 통합
- **네이밍 컨벤션**: HTML ID/Class를 kebab-case로 통일
- **중복 코드 제거**: 공통 로직을 common.js로 추출
- **컴포넌트화**: Header, Footer를 별도 파일로 분리하여 재사용성 향상

### 4. UX 개선
- 페이지네이션 기능 구현 (상품 목록 페이지)
- 판매자의 자기 상품 장바구니 담기 방지
- 드롭다운 메뉴 개선 (마이페이지, 판매자 센터)
- 엔터키 로그인 지원
- 반응형 디자인 버그 수정

<img width="1895" height="862" alt="image" src="https://github.com/user-attachments/assets/82a868af-5bf5-468a-ba13-74b87a3841ba" />
*▲ lighthouse 검사 결과*

---

## 에러 트래킹 및 품질 관리

### 1. GitHub Issues 기반 이슈 관리

```markdown
## 추가 기능

> 추가하려는 기능에 대해 간결하게 설명해주세요

## 작업 상세 내용

- [ ] TODO 1
- [ ] TODO 2
- [ ] TODO 3
```

### 2. PR (Pull Request) 기반 코드 리뷰

모든 기능은 **feature 브랜치**에서 개발 후 **PR을 통해 병합**합니다.

```
main (프로덕션)
  │
  └── dev (개발)
        │
        ├── feat/login        → PR #119
        ├── chore/details     → PR #117
        └── feat/seller-cart  → PR #115
```

### 3. 에러 체킹 프로세스

```
[에러 발견]
    │
    ├── 1. GitHub Issue 생성
    │      └── 이슈 템플릿에 따라 상세 내용 작성
    │
    ├── 2. 담당자 할당 (Assignees)
    │
    ├── 3. Feature Branch 생성
    │      └── fix/issue-number 또는 feat/feature-name
    │
    ├── 4. 로컬에서 수정 및 테스트
    │      ├── Console 에러 확인
    │      ├── Network 탭에서 API 응답 확인
    │      └── 크로스 브라우저 테스트
    │
    ├── 5. PR 생성 및 코드 리뷰
    │      └── 팀원 리뷰 후 Approve
    │
    └── 6. dev 브랜치로 Merge
```

### 4. 주요 에러 해결 사례

| 이슈                | 문제                                           | 해결                            | PR   |
| ------------------- | ---------------------------------------------- | ------------------------------- | ---- |
| 로그인 UX           | 엔터키로 로그인 불가                           | keydown 이벤트 추가             | #119 |
| 판매자 장바구니     | 판매자가 자신의 상품을 장바구니에 담을 수 있음 | 판매자 비활성화 버튼 구현       | #115 |
| 스타일 이슈         | 상세 페이지 레이아웃 깨짐                      | CSS 수정                        | #117 |
| 판매자 센터 접근성  | 헤더의 마이페이지 버튼과 역할 혼란            | 판매자 센터 전용 버튼으로 분리  | #142 |
| Footer 링크         | 푸터 하이퍼링크 동작 오류                      | 경로 수정                       | #144 |
| 페이지네이션        | 상품 목록이 한 페이지에 모두 표시됨           | 페이지네이션 UI 및 기능 구현    | #135 |
| GitHub Pages 배포   | 서브 경로에서 리소스 로드 실패                 | 상대 경로로 전환 및 로직 수정   | #147 |

---

## 프로젝트 특징 및 성과

### 주요 특징
1. **프레임워크 없는 구현**: React, Vue 등 프레임워크 없이 Vanilla JavaScript로 구현
2. **모듈화된 아키텍처**: API, 페이지, 유틸리티를 명확하게 분리
3. **재사용 가능한 컴포넌트**: Header, Footer, Modal 등 공통 컴포넌트 구현
4. **체계적인 협업**: GitHub Issues, PR, 코드 리뷰를 통한 체계적인 팀 협업
5. **웹 표준 준수**: 시맨틱 HTML, 웹 접근성, SEO 최적화

### 학습 성과
- **JavaScript 심화**: DOM 조작, 이벤트 처리, 비동기 프로그래밍
- **모듈 패턴**: ES6 모듈 시스템을 활용한 코드 구조화
- **API 통신**: Fetch API를 활용한 RESTful API 통신
- **협업 프로세스**: Git Flow, 코드 리뷰, 이슈 관리
- **웹 접근성**: ARIA, 시맨틱 HTML, 키보드 내비게이션
- **배포**: GitHub Pages를 활용한 정적 사이트 배포

---

