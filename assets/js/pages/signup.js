const BASE_URL = "https://api.wenivops.co.kr/services/open-market";

let state = {
    currentType: "BUYER",
    isIdVerified: false,
    isBusinessNumVerified: false,
};

const initSignup = () => {
    const tabs = document.querySelectorAll(".tab");
    const forms = document.querySelectorAll(".signup-form");
    const submitBtn = document.querySelector(".join-btn");
    const agreeCheck = document.getElementById("agree-check");

    // 메시지 표시 함수
    const setMessage = (inputId, errorId, message, type) => {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (!errorEl) return;
        errorEl.classList.remove("error", "success");
        if (type === "error") {
            inputEl?.classList.add("error");
            errorEl.classList.add("error");
        } else {
            inputEl?.classList.add("success");
            errorEl.classList.add("success");
        }
        errorEl.textContent = message;
        errorEl.style.display = "block";
    };

    // 휴대폰 번호 최대 4자리 제한
    const handlePhoneInput = (e) => {
        if (e.target.value.length > 4) {
            e.target.value = e.target.value.slice(0, 4);
        }
    };

    // 1. 아이디 중복 확인 (명세서 1.3 기준)
    const checkId = async () => {
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const inputId = `${prefix}-id`;
        const errorId = `${prefix}-id-error`;
        const username = document.getElementById(inputId).value;

        if (!username) {
            setMessage(inputId, errorId, "아이디를 입력해주세요.", "error");
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/accounts/validate-username/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(inputId, errorId, data.message || "사용 가능한 아이디입니다.", "success");
                state.isIdVerified = true;
            } else {
                setMessage(inputId, errorId, data.error || "이미 사용 중인 아이디입니다.", "error");
                state.isIdVerified = false;
            }
            updateButtonState();
        } catch (e) {
            setMessage(inputId, errorId, "서버 연결에 실패했습니다.", "error");
        }
    };

    // 2. 사업자등록번호 검증 (명세서 1.4 기준)
    const checkBusinessNum = async () => {
        const businessNum = document.getElementById("seller-num").value;
        if (!businessNum) {
            alert("사업자등록번호를 입력해주세요.");
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/accounts/seller/validate-registration-number//`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company_registration_number: businessNum }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || "인증되었습니다.");
                state.isBusinessNumVerified = true;
            } else {
                alert(data.error || "유효하지 않은 번호입니다.");
                state.isBusinessNumVerified = false;
            }
            updateButtonState();
        } catch (e) {
            alert("인증 서버 연결 실패");
        }
    };

    // 3. 비밀번호 실시간 체크 (아이콘)
    const handlePwInput = () => {
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const pw = document.getElementById(`${prefix}-pw`).value;
        const pwCheck = document.getElementById(`${prefix}-pw-check`).value;
        
        const pwStatusIcon = document.getElementById(state.currentType === "BUYER" ? "pw-status" : `${prefix}-pw-status`);
        const pwCheckIcon = document.getElementById(state.currentType === "BUYER" ? "pw-check-status" : `${prefix}-pw-check-status`);

        if (pw.length >= 8) pwStatusIcon?.classList.add("active");
        else pwStatusIcon?.classList.remove("active");

        if (pw !== "" && pw === pwCheck) pwCheckIcon?.classList.add("active");
        else pwCheckIcon?.classList.remove("active");

        updateButtonState();
    };

    // 4. 회원가입 제출 (명세서 1.1, 1.2 기준)
    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const phoneInputs = document.querySelectorAll(state.currentType === "BUYER" ? "#buyer-form .phone" : "#seller-form .phone");
        const phonePrefix = state.currentType === "BUYER" 
            ? document.querySelector("#buyer-form .select").value 
            : document.getElementById("seller-phone-prefix").value;

        const signupData = {
            username: document.getElementById(`${prefix}-id`).value,
            password: document.getElementById(`${prefix}-pw`).value,
            name: document.getElementById(`${prefix}-name`).value,
            phone_number: `${phonePrefix}${phoneInputs[0].value}${phoneInputs[1].value}`,
        };

        // 판매자 추가 필드
        if (state.currentType === "SELLER") {
            signupData.company_registration_number = document.getElementById("seller-num").value;
            signupData.store_name = document.getElementById("store-name").value;
        }

        // 명세서에 따른 주소 분기
        const signupPath = state.currentType === "BUYER" 
            ? "/accounts/buyer/signup/" 
            : "/accounts/seller/signup/";

        try {
            const res = await fetch(`${BASE_URL}${signupPath}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });
            const data = await res.json();
            if (res.ok) {
                alert("가입 완료! 로그인 페이지로 이동합니다.");
                location.href = "login.html";
            } else {
                // 에러 메시지가 객체 형태로 올 수 있으므로 처리
                const errorMsg = typeof data === 'object' ? JSON.stringify(data) : data;
                alert(`가입 실패: ${errorMsg}`);
            }
        } catch (error) {
            alert("가입 요청 중 오류 발생");
        }
    };

    // 탭 전환 및 이벤트 바인딩
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            forms.forEach(f => f.classList.remove("active"));
            tab.classList.add("active");
            forms[index].classList.add("active");
            state.currentType = index === 0 ? "BUYER" : "SELLER";
            state.isIdVerified = false;
            state.isBusinessNumVerified = false;
            updateButtonState();
        });
    });

    const updateButtonState = () => {
        const isAgree = agreeCheck.checked;
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const pw = document.getElementById(`${prefix}-pw`).value;
        const pwCheck = document.getElementById(`${prefix}-pw-check`).value;
        const isPwMatch = pw !== "" && pw === pwCheck && pw.length >= 8;

        if (state.currentType === "BUYER") {
            const nameOk = document.getElementById("user-name").value.trim() !== "";
            submitBtn.disabled = !(state.isIdVerified && isPwMatch && nameOk && isAgree);
        } else {
            const nameOk = document.getElementById("seller-name").value.trim() !== "";
            const storeOk = document.getElementById("store-name").value.trim() !== "";
            submitBtn.disabled = !(state.isIdVerified && isPwMatch && nameOk && storeOk && state.isBusinessNumVerified && isAgree);
        }
    };

    document.getElementById("user-check-btn")?.addEventListener("click", checkId);
    document.getElementById("seller-check-btn")?.addEventListener("click", checkId);
    document.getElementById("seller-num-btn")?.addEventListener("click", checkBusinessNum);
    submitBtn.addEventListener("click", handleSignupSubmit);
    
    document.querySelectorAll("input").forEach(input => {
        if (input.classList.contains("phone")) {
            input.addEventListener("input", handlePhoneInput);
        }
        input.addEventListener("input", () => {
            handlePwInput();
            updateButtonState();
        });
    });
    agreeCheck.addEventListener("change", updateButtonState);
};

window.onload = initSignup;