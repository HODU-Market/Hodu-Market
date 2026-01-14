# 오픈마켓 API 명세

## 0. 접속하기/요청 URL

### Base URL

```
https://api.wenivops.co.kr/services/open-market
```

### 테스트 계정

#### 구매자(buyer)

- ID: buyer1, PW: weniv1234
- ID: buyer2, PW: weniv1234
- ID: buyer3, PW: weniv1234

#### 판매자(seller)

- ID: seller1, PW: weniv1234
- ID: seller2, PW: weniv1234
- ID: seller3, PW: weniv1234

### 헤더에 토큰 넣기

```javascript
// Authorization를 이용하며 Bearer를 접두사로 사용합니다.
fetch("주소", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### 토큰 관련 에러

```json
// 토큰이 없을 경우, status: 401
{
    "detail": "자격 인증데이터(authentication credentials)가 제공되지 않았습니다."
}

// 토큰이 만료되었을 경우, status: 401
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token is invalid or expired"
        }
    ]
}

// refresh token을 사용했을 경우, status: 401
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token has wrong type"
        }
    ]
}

// 유효하지 않은 토큰, status: 401
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token is invalid"
        }
    ]
}
```

---

## 1. 계정

### 1.1 구매자 계정 만들기 (POST)

**Endpoint:** `POST /accounts/buyer/signup/`

**Request Body:**

```json
{
  "username": "string", // 아이디
  "password": "string", // 비밀번호
  "name": "string", // 이름
  "phone_number": "string" // 전화번호는 010으로 시작하는 10~11자리 숫자
}
```

**유효성 규칙:**

1. 모든 필드는 필수로 작성해야 합니다.
2. 비밀번호는 8자 이상, 영소문자, 숫자를 포함해야 합니다.
3. 핸드폰 번호는 010으로 시작하는 10~11자리 숫자로만 이루어져 있습니다.
4. 이름(name)은 중복될 수 있습니다.

**Success Response:**

```json
{
  "username": "string",
  "name": "string",
  "phone_number": "string",
  "user_type": "BUYER"
}
```

**Error Responses:**

| 에러 상황              | Status | 메시지                                                         |
| ---------------------- | ------ | -------------------------------------------------------------- |
| 필드 미입력            | 400    | 이 필드는 blank일 수 없습니다.                                 |
| 비밀번호 8자 미만      | 400    | 비밀번호는 8자 이상이어야 합니다.                              |
| 비밀번호 영소문자 없음 | 400    | 비밀번호는 한개 이상의 영소문자가 필수적으로 들어가야 합니다.  |
| 비밀번호 숫자 없음     | 400    | 비밀번호는 한개 이상의 숫자가 필수적으로 들어가야 합니다.      |
| 아이디 중복            | 400    | 이미 등록된 아이디입니다.                                      |
| 아이디 형식 오류       | 400    | 아이디는 영어 소문자, 대문자, 숫자만 가능합니다.               |
| 아이디 길이 초과       | 400    | 이 필드의 글자 수가 20 이하인지 확인하십시오.                  |
| 전화번호 중복          | 400    | 이미 등록된 핸드폰 번호입니다.                                 |
| 전화번호 형식 오류     | 400    | 핸드폰번호는 01\*으로 시작해야 하는 10~11자리 숫자여야 합니다. |

---

### 1.2 판매자 계정 만들기 (POST)

**Endpoint:** `POST /accounts/seller/signup/`

**Request Body:**

```json
{
  "username": "string", // 아이디
  "password": "string", // 비밀번호
  "name": "string", // 이름
  "phone_number": "string", // 전화번호
  "company_registration_number": "string", // 사업자등록번호 (10자리)
  "store_name": "string" // 스토어 이름
}
```

**유효성 규칙:**

1. 모든 필드는 필수로 작성해야 합니다.
2. 이름(name)은 중복될 수 있습니다.
3. 비밀번호는 8자 이상, 영소문자, 숫자를 포함해야 합니다.
4. 핸드폰 번호는 010으로 시작하는 10~11자리 숫자로만 이루어져 있습니다.
5. 사업자등록번호는 10자리로 이루어진 숫자입니다.
6. 스토어이름(store_name)은 중복될 수 없습니다.

**Success Response:**

```json
{
  "username": "string",
  "name": "string",
  "phone_number": "string",
  "user_type": "SELLER",
  "company_registration_number": "string",
  "store_name": "string"
}
```

**Error Responses:**

| 에러 상황              | 메시지                                                         |
| ---------------------- | -------------------------------------------------------------- |
| 필드 미입력            | 이 필드는 blank일 수 없습니다.                                 |
| 비밀번호 8자 미만      | 비밀번호는 8자 이상이어야 합니다.                              |
| 비밀번호 영소문자 없음 | 비밀번호는 한개 이상의 영소문자가 필수적으로 들어가야 합니다.  |
| 비밀번호 숫자 없음     | 비밀번호는 한개 이상의 숫자가 필수적으로 들어가야 합니다.      |
| 아이디 중복            | 해당 사용자 아이디는 이미 존재합니다.                          |
| 아이디 형식 오류       | ID는 20자 이내의 영어 소문자, 대문자, 숫자만 가능합니다.       |
| 전화번호 중복          | 해당 사용자 전화번호는 이미 존재합니다.                        |
| 전화번호 형식 오류     | 핸드폰번호는 01\*으로 시작해야 하는 10~11자리 숫자여야 합니다. |
| 사업자등록번호 중복    | 해당 사업자등록번호는 이미 존재합니다.                         |
| 스토어 이름 중복       | 해당 스토어이름은 이미 존재합니다.                             |

---

### 1.3 아이디 검증하기

**Endpoint:** `POST /accounts/validate-username/`

**Request Body:**

```json
{
  "username": "string"
}
```

**Responses:**

| Status | 응답                                         |
| ------ | -------------------------------------------- |
| 400    | `{"error": "username 필드를 추가해주세요."}` |
| 400    | `{"error": "이미 사용 중인 아이디입니다."}`  |
| 200    | `{"message": "사용 가능한 아이디입니다."}`   |

---

### 1.4 사업자등록번호 검증하기

**Endpoint:** `POST /accounts/seller/validate-registration-number/`

**Request Body:**

```json
{
  "company_registration_number": "string"
}
```

**Responses:**

| Status | 응답                                                            |
| ------ | --------------------------------------------------------------- |
| 400    | `{"error": "company_registration_number 필드를 추가해주세요."}` |
| 400    | `{"error": "사업자등록번호는 10자리 숫자여야 합니다."}`         |
| 409    | `{"error": "이미 등록된 사업자등록번호입니다."}`                |
| 200    | `{"message": "사용 가능한 사업자등록번호입니다."}`              |

---

## 2. 로그인/로그아웃

### 2.1 로그인

#### 2.1.1 로그인 요청하기

**Endpoint:** `POST /accounts/login/`

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**

```json
{
    "access": "token",
    "refresh": "token",
    "user": {
        "username": "string",
        "name": "string",
        "phone_number": "string",
        "user_type": "BUYER" | "SELLER"
    }
}
```

**Error Response (401):**

```json
{
  "error": "아이디 또는 비밀번호가 올바르지 않습니다."
}
```

**토큰 수명:**

- access: 5분
- refresh: 1일

#### 2.1.2 refresh token으로 새 access token 요청하기

**Endpoint:** `POST /accounts/token/refresh/`

**Request Body:**

```json
{
  "refresh": "로그인 시 받아온 refresh 토큰"
}
```

**Success Response (200):**

```json
{
  "access": "token"
}
```

**Error Response (401):**

```json
{
  "detail": "Token is invalid",
  "code": "token_not_valid"
}
```

---

### 2.2 로그아웃

JWT는 stateless하기 때문에 서버에 로그아웃을 요청할 수 없습니다.
클라이언트 측에서 토큰을 삭제하거나 애플리케이션 상태를 초기화해주셔야 합니다.

---

## 3. 상품

### 3.1 상품 전체 불러오기 (GET)

#### 3.1.1 상품 전체 불러오기

**Endpoint:** `GET /products/`

**Success Response (200):**

```json
{
    "count": 100,
    "next": "URL",
    "previous": "URL",
    "results": [
        {
            "id": 1,
            "name": "string",
            "info": "string",
            "image": "URL",
            "price": 10000,
            "shipping_method": "PARCEL" | "DELIVERY",
            "shipping_fee": 3000,
            "stock": 100,
            "seller": {
                "username": "string",
                "name": "string",
                "phone_number": "string",
                "user_type": "SELLER",
                "company_registration_number": "string",
                "store_name": "string"
            },
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

**shipping_method:**

- `PARCEL`: 택배, 소포, 등기
- `DELIVERY`: 직접배송(화물배달)

**상품이 없을 경우 (200):**

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

---

#### 3.1.2 판매자 상품 불러오기

**Endpoint:** `GET /<str:seller_name>/products/`

`seller_name`은 판매자의 `name`을 사용합니다.

**Success Response (200):**

```json
{
    "count": 100,
    "next": "URL",
    "previous": "URL",
    "results": [
        {
            "id": 1,
            "name": "string",
            "info": "string",
            "image": "URL",
            "price": 10000,
            "shipping_method": "PARCEL" | "DELIVERY",
            "shipping_fee": 3000,
            "stock": 100,
            "seller": {
                "username": "string",
                "name": "string",
                "phone_number": "string",
                "user_type": "SELLER",
                "company_registration_number": "string",
                "store_name": "string"
            },
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

**Error Responses:**

| Status | 응답                                             |
| ------ | ------------------------------------------------ |
| 404    | `{"detail": "No User matches the given query."}` |
| 403    | `{"detail": "이 사용자는 판매자가 아닙니다."}`   |

---

### 3.2 상품 등록하기 (POST)

**권한:** `seller`만 요청 가능

**Endpoint:** `POST /products/`

**Request Body (multipart/form-data):**

```json
{
    "name": "string",
    "info": "string",
    "image": "파일(*.jpg, *.gif, *.png)",
    "price": 10000,
    "shipping_method": "PARCEL" | "DELIVERY",
    "shipping_fee": 3000,
    "stock": 100
}
```

**Success Response:**

```json
{
    "id": 1,
    "name": "string",
    "info": "string",
    "image": "URL",
    "price": 10000,
    "shipping_method": "PARCEL" | "DELIVERY",
    "shipping_fee": 3000,
    "stock": 100,
    "seller": {
        "username": "string",
        "name": "string",
        "phone_number": "string",
        "user_type": "SELLER",
        "company_registration_number": "string",
        "store_name": "string"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**

| 에러 상황      | Status | 응답                                                          |
| -------------- | ------ | ------------------------------------------------------------- |
| buyer가 요청   | 403    | `{"detail": "이 작업을 수행할 권한(permission)이 없습니다."}` |
| 필드 누락      | 400    | 각 필드별로 `["이 필드는 필수 항목입니다."]`                  |
| 정수가 아닌 값 | 400    | `"유효한 정수(integer)를 넣어주세요."`                        |

---

### 3.3 상품 디테일 (GET)

**Endpoint:** `GET /products/<int:product_id>/`

**Success Response (200):**

```json
{
    "id": 1,
    "name": "string",
    "info": "string",
    "image": "URL",
    "price": 10000,
    "shipping_method": "PARCEL" | "DELIVERY",
    "shipping_fee": 3000,
    "stock": 100,
    "seller": {
        "username": "string",
        "name": "string",
        "phone_number": "string",
        "user_type": "SELLER",
        "company_registration_number": "string",
        "store_name": "string"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Response (400):**

```json
{
  "detail": "No Product matches the given query."
}
```

---

### 3.4 상품 수정하기 (PUT)

**권한:** 판매자 본인만 가능

**Endpoint:** `PUT /products/<int:product_id>/`

**Request Body:**

- 수정이 필요한 값들만 넣어주면 됩니다.
- 값을 넣지 않을 경우 이전에 저장된 값들이 그대로 저장됩니다.
- id, seller, created_at, updated_at은 수정할 수 없습니다.

---

### 3.5 상품 삭제하기 (DELETE)

**권한:** 판매자 본인만 가능

**Endpoint:** `DELETE /products/<int:product_id>/`

**Responses:**

| Status | 응답                                                          |
| ------ | ------------------------------------------------------------- |
| 200    | `{"detail": "상품이 삭제되었습니다."}`                        |
| 403    | `{"detail": "이 작업을 수행할 권한(permission)이 없습니다."}` |
| 404    | `{"detail": "찾을 수 없습니다."}`                             |

---

### 3.6 상품 제목 검색하기 (GET)

**Endpoint:** `GET /products/?search=입력값`

**Success Response (200):**

```json
{
    "count": 100,
    "next": "URL",
    "previous": "URL",
    "results": [
        {
            "id": 1,
            "name": "string",
            "info": "string",
            "image": "URL",
            "price": 10000,
            "shipping_method": "PARCEL" | "DELIVERY",
            "shipping_fee": 3000,
            "stock": 100,
            "seller": {
                "username": "string",
                "name": "string",
                "phone_number": "string",
                "user_type": "SELLER",
                "company_registration_number": "string",
                "store_name": "string"
            },
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

---

## 4. 장바구니

**권한:** `user_type`이 `BUYER`인 경우만 접근 가능

### 4.1 장바구니 목록 보기 (GET)

**Endpoint:** `GET /cart/`

**Success Response (200):**

```json
{
  "count": 5,
  "next": "URL",
  "previous": "URL",
  "results": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "string",
        "price": 10000
        // ... 상품 정보
      },
      "quantity": 2,
      "added_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**장바구니가 비어있을 경우 (200):**

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

---

### 4.2 장바구니에 물건 넣기 (POST)

**Endpoint:** `POST /cart/`

**Request Body:**

```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Success Response:**

```json
{
  "detail": "장바구니에 상품이 담겼습니다."
}
```

**중요:** 장바구니에 이미 있는 경우에도 POST 요청으로 보냅니다.

- **장바구니에 이미 있을 경우는 수량만큼 더하기가 됩니다.**

---

### 4.3 장바구니 디테일 (GET)

**Endpoint:** `GET /cart/<int:cart_item_id>/`

**Success Response:**

```json
{
  "id": 1,
  "product": {
    // 상품 정보
  },
  "quantity": 2,
  "added_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**

| 상황                       | 응답                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| buyer가 아니거나 토큰 없음 | `{"detail": "자격 인증데이터(authentication credentials)가 제공되지 않았습니다."}`          |
| 다른 사용자의 장바구니     | `{"detail": "접근권한이 없습니다."}`                                                        |
| 존재하지 않는 항목         | `{"detail": "찾을 수 없습니다."}` 또는 `{"detail": "No CartItem matches the given query."}` |

---

### 4.4 장바구니 수량 수정하기 (PUT)

**Endpoint:** `PUT /cart/<int:cart_item_id>/`

**Request Body:**

```json
{
  "quantity": 3
}
```

**Success Response:**

```json
{
  "id": 1,
  "product": {
    // 상품 정보
  },
  "quantity": 3,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 4.5 장바구니 개별 삭제하기 (DELETE)

**Endpoint:** `DELETE /cart/<int:cart_item_id>/`

**Success Response:**

```json
{
  "detail": "장바구니에 담긴 상품이 삭제되었습니다."
}
```

---

### 4.6 장바구니 전부 삭제하기 (DELETE)

**Endpoint:** `DELETE /cart/`

**Success Response:**

```json
{
  "detail": "장바구니에 담긴 5개의 상품이 삭제되었습니다."
}
```

---

## 5. 주문하기

주문하기는 두 가지 방법으로 나뉩니다:

1. `direct_order`: 상품 상세페이지에서 바로 주문
2. `cart_order`: 장바구니에 담긴 제품 주문

### 5.1 주문 생성하기 (POST)

#### 5.1.1 direct_order로 주문 생성하기

**Endpoint:** `POST /order/`

**Request Body:**

```json
{
    "order_kind": "direct_order",
    "product": 1,
    "quantity": 2,
    "total_price": 23000,
    "receiver": "string",
    "receiver_phone_number": "string",
    "address": "string",
    "address_message": "string | null",
    "payment_method": "card" | "deposit" | "phone" | "naverpay" | "kakaopay"
}
```

**payment_method:**

- `card`: 신용/체크카드
- `deposit`: 무통장 입금
- `phone`: 휴대폰 결제
- `naverpay`: 네이버페이
- `kakaopay`: 카카오페이

**Success Response:**

```json
{
  "id": 1,
  "order_number": "string",
  "payment_method": "card",
  "order_status": "payment_complete",
  "order_type": "direct_order",
  "total_price": 23000,
  "created_at": "2024-01-01T00:00:00Z",
  "order_items": [
    {
      "product": {
        // 상품 정보
      },
      "ordered_quantity": 2,
      "ordered_unit_price": 10000,
      "ordered_shipping_fee": 3000,
      "item_total_price": 23000
    }
  ],
  "receiver": "string",
  "receiver_phone_number": "string",
  "address": "string",
  "delivery_message": "string | null",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**order_status:**

- `payment_pending`: 결제 대기 중
- `payment_complete`: 결제 완료
- `preparing`: 상품 준비 중
- `shipping`: 배송 중
- `delivered`: 배송 완료
- `cancelled`: 주문취소

**총 금액 계산 방법:**

```
(상품가격 × 주문수량) + 배송비
```

※ 배송비는 한번만 부과됩니다.

**Error Responses:**

| 상황                     | 응답                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| 필수 필드 누락           | `{"필드명": ["이 필드는 필수 항목입니다."]}`                                                 |
| payment_method 잘못된 값 | `{"payment_method": ["\"___\"이 유효하지 않은 선택(choice)입니다."]}`                        |
| 총 금액 불일치           | `{"non_field_errors": "total_price가 맞지 않습니다. 계산 금액은 ___원입니다.(배송비 포함)"}` |

---

#### 5.1.2 cart_order로 주문 생성하기

**Endpoint:** `POST /order/`

**Request Body:**

```json
{
    "order_type": "cart_order",
    "cart_items": [1, 2, 3],
    "total_price": 50000,
    "receiver": "string",
    "receiver_phone_number": "string",
    "address": "string",
    "address_message": "string | null",
    "payment_method": "card" | "deposit" | "phone" | "naverpay" | "kakaopay"
}
```

**참고:** cart_order는 장바구니에 담긴 수량을 그대로 사용하기 때문에 quantity를 보내지 않습니다.

**Success Response:**

```json
{
  "id": 1,
  "order_number": "string",
  "payment_method": "card",
  "order_status": "payment_complete",
  "order_type": "cart_order",
  "total_price": 50000,
  "order_items": [
    {
      "product": {
        // 상품 정보
      },
      "ordered_quantity": 2,
      "ordered_unit_price": 10000,
      "ordered_shipping_fee": 3000,
      "item_total_price": 23000
    },
    {
      "product": {
        // 상품 정보
      },
      "ordered_quantity": 1,
      "ordered_unit_price": 20000,
      "ordered_shipping_fee": 3000,
      "item_total_price": 23000
    }
  ],
  "receiver": "string",
  "receiver_phone_number": "string",
  "address": "string",
  "delivery_message": "string | null",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**

| 상황                 | 응답                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- |
| 필수 필드 누락       | `"이 필드는 필수 항목입니다."`                                                               |
| 총 금액 불일치       | `{"non_field_errors": "total_price가 맞지 않습니다. 계산 금액은 ___원입니다.(배송비 포함)"}` |
| 장바구니에 없는 상품 | `{"non_field_errors": ["다음 카트 아이템이 유효하지 않습니다: 상품명(pk)"]}`                 |
| 존재하지 않는 상품   | `"유효하지 않은 pk \"{pk}\" - 객체가 존재하지 않습니다."`                                    |
| 재고 부족            | `{"non_field_errors": ["<상품명(pk)>의 재고가 부족하여 주문할 수 없습니다."]}`               |

---

### 5.2 주문 목록 가져오기 (GET)

**권한:** 구매자만 요청 가능

**Endpoint:** `GET /order/`

**Success Response (200):**

```json
{
  "count": 10,
  "next": "URL",
  "previous": "URL",
  "results": [
    {
      "id": 1,
      "order_number": "string",
      "payment_method": "card",
      "order_status": "payment_complete",
      "order_type": "direct_order",
      "total_price": 23000,
      "order_items": [
        {
          "product": {
            // 상품 정보
          },
          "ordered_quantity": 2,
          "ordered_unit_price": 10000,
          "ordered_shipping_fee": 3000,
          "item_total_price": 23000
        }
      ],
      "receiver": "string",
      "receiver_phone_number": "string",
      "address": "string",
      "delivery_message": "string | null",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**주문이 없을 경우 (200):**

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

---

### 5.3 개별 주문 가져오기 (GET)

**권한:** 구매자만 요청 가능

**Endpoint:** `GET /order/<int:order_pk>/`

**Success Response:**

```json
{
  "id": 1,
  "order_number": "string",
  "payment_method": "card",
  "order_status": "payment_complete",
  "order_type": "direct_order",
  "total_price": 23000,
  "order_items": [
    {
      "product": {
        // 상품 정보
      },
      "ordered_quantity": 2,
      "ordered_unit_price": 10000,
      "ordered_shipping_fee": 3000,
      "item_total_price": 23000
    }
  ],
  "receiver": "string",
  "receiver_phone_number": "string",
  "address": "string",
  "delivery_message": "string | null",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Response:**

```json
{
  "detail": "No Order matches the given query."
}
```

---

### 5.4 주문 수정하기

실제 서비스들을 보면 주문은 생성 즉시 seller와 계약되는 형태라 buyer가 주문을 수정할 수 없습니다.

---

### 5.5 주문 삭제하기 (DELETE)

**참고:** 주문 삭제 시 실제 객체가 삭제되는 것이 아니라 `order_status`가 `cancelled`로 변경됩니다.

**Endpoint:** `DELETE /order/<int:order_pk>/`

**Success Response:**

```json
{
  "detail": "주문이 성공적으로 취소되었습니다."
}
```

**Error Response:**

```json
{
  "detail": "No Order matches the given query."
}
```

---

## 부록: 빠른 참조

### 인증 관련

- 로그인: `POST /accounts/login/`
- 토큰 갱신: `POST /accounts/token/refresh/`
- 헤더 형식: `Authorization: Bearer {token}`

### 상품 관련

- 전체 상품: `GET /products/`
- 상품 검색: `GET /products/?search={키워드}`
- 상품 상세: `GET /products/{id}/`
- 상품 등록: `POST /products/` (판매자)

### 장바구니 관련 (구매자)

- 목록: `GET /cart/`
- 추가: `POST /cart/`
- 수정: `PUT /cart/{id}/`
- 삭제: `DELETE /cart/{id}/`
- 전체 삭제: `DELETE /cart/`

### 주문 관련 (구매자)

- 주문 생성: `POST /order/`
- 주문 목록: `GET /order/`
- 주문 상세: `GET /order/{id}/`
- 주문 취소: `DELETE /order/{id}/`
