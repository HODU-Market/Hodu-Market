# HODU-Market (호두마켓)

> 고양이 물품 전문 온라인 쇼핑몰

---

## 목차

1. [프로젝트 소개](#프로젝트-소개)
2. [팀원 및 역할 분담](#팀원-및-역할-분담)
3. [WBS 추진일정](#wbs-추진일정)
4. [프로젝트 구조 (MPA)](#프로젝트-구조-mpa)
5. [공용 모듈 (Common)](#공용-모듈-common)
6. [주요 기능](#주요-기능)
7. [에러 트래킹 및 품질 관리](#에러-트래킹-및-품질-관리)

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

<img width="1499" height="663" alt="스크린샷 2026-01-17 103836" src="https://github.com/user-attachments/assets/4f459f5b-4422-4d77-a07e-46d465662a3c" />

---

## 프로젝트 구조 (MPA)

본 프로젝트는 **MPA (Multi-Page Application)** 구조를 채택하여 각 페이지가 독립적인 HTML 파일로 구성됩니다.

<img width="1201" height="717" alt="스크린샷 2026-01-17 102154" src="https://github.com/user-attachments/assets/58cb5346-e5d4-4acb-bee7-3c07c1d04488" />

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
- 주문하기

### 판매자 기능

- 판매자 회원가입 / 로그인
- 상품 등록 / 수정 / 삭제
- 재고 관리

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
    └── 6. main/dev 브랜치로 Merge
```

### 4. 주요 에러 해결 사례

| 이슈            | 문제                                           | 해결                      | PR   |
| --------------- | ---------------------------------------------- | ------------------------- | ---- |
| 로그인 UX       | 엔터키로 로그인 불가                           | keydown 이벤트 추가       | #119 |
| 판매자 장바구니 | 판매자가 자신의 상품을 장바구니에 담을 수 있음 | 판매자 비활성화 버튼 구현 | #115 |
| 스타일 이슈     | 상세 페이지 레이아웃 깨짐                      | CSS 수정                  | #117 |

