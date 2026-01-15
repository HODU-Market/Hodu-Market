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

    // [통합 메시지 관리]
    const setMessage = (inputId, errorId, message, type) => {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (!errorEl) return;

        errorEl.classList.remove("error", "success");
        if (inputEl) inputEl.classList.remove("error");

        if (type === "error") {
            if (inputEl) inputEl.classList.add("error");
            errorEl.classList.add("error");
        } else if (type === "success") {
            errorEl.classList.add("success");
        }
        
        errorEl.textContent = message;
        errorEl.style.display = "block";
    };

    const hideMessage = (inputId, errorId) => {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (inputEl) inputEl.classList.remove("error");
        if (errorEl) {
            errorEl.style.display = "none";
            errorEl.textContent = "";
        }
    };

    // [기능 1] 전화번호 최대 4자리 제한
    const handlePhoneInput = (e) => {
        if (e.target.value.length > 4) {
            e.target.value = e.target.value.slice(0, 4);
        }
    };

    document.querySelectorAll(".input.phone").forEach(input => {
        input.addEventListener("input", handlePhoneInput);
    });

    // 1. 탭 전환
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

    // 2. 아이디 중복 확인 (영문 체크 포함)
    const checkId = async () => {
        const inputId = state.currentType === "BUYER" ? "user-id" : "seller-id";
        const errorId = state.currentType === "BUYER" ? "user-id-error" : "seller-id-error";
        const username = document.getElementById(inputId).value;
        const englishOnly = /^[A-Za-z0-9]+$/; 
        
        if (!username) {
            setMessage(inputId, errorId, "아이디를 입력해주세요.", "error");
            return;
        }
        if (!englishOnly.test(username)) {
            setMessage(inputId, errorId, "아이디는 영문 및 숫자만 사용 가능합니다.", "error");
            state.isIdVerified = false;
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
                setMessage(inputId, errorId, "멋진 아이디네요 :)", "success");
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

    document.getElementById("user-check-btn")?.addEventListener("click", checkId);
    document.getElementById("seller-check-btn")?.addEventListener("click", checkId);

    // [기능 2] 사업자 등록 번호 인증 (신규 추가)
    const checkBusinessNum = async () => {
        const businessNum = document.getElementById("seller-num").value;
        if (!businessNum) {
            alert("사업자 등록 번호를 입력해주세요.");
            return;
        }
        
        try {
            const res = await fetch(`${BASE_URL}/accounts/validate-company-registration-number/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company_registration_number: businessNum }),
            });
            const data = await res.json();

            if (res.ok) {
                alert("인증되었습니다.");
                state.isBusinessNumVerified = true;
            } else {
                alert(data.error || "유효하지 않은 사업자 번호입니다.");
                state.isBusinessNumVerified = false;
            }
            updateButtonState();
        } catch (e) {
            alert("서버 통신에 실패했습니다.");
        }
    };

    document.getElementById("seller-num-btn")?.addEventListener("click", checkBusinessNum);

    // 3. 비밀번호 실시간 확인
    const handlePwInput = () => {
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const pwEl = document.getElementById(`${prefix}-pw`);
        const pwCheckEl = document.getElementById(`${prefix}-pw-check`);
        const errorId = `${prefix}-pw-error`;
        
        const pwStatusIcon = document.getElementById(state.currentType === "BUYER" ? "pw-status" : `${prefix}-pw-status`);
        const pwCheckIcon = document.getElementById(state.currentType === "BUYER" ? "pw-check-status" : `${prefix}-pw-check-status`);

        const pwValue = pwEl.value;
        const pwCheckValue = pwCheckEl.value;

        if (pwValue.length >= 8) {
            pwStatusIcon?.classList.add("active");
        } else {
            pwStatusIcon?.classList.remove("active");
        }

        if (pwCheckValue === "") {
            hideMessage(`${prefix}-pw-check`, errorId);
            pwCheckIcon?.classList.remove("active");
        } else if (pwValue !== pwCheckValue) {
            setMessage(`${prefix}-pw-check`, errorId, "비밀번호가 일치하지 않습니다.", "error");
            pwCheckIcon?.classList.remove("active");
        } else {
            hideMessage(`${prefix}-pw-check`, errorId);
            pwCheckIcon?.classList.add("active");
        }
        updateButtonState();
    };

    document.querySelectorAll('input[type="password"]').forEach(input => {
        input.addEventListener("input", handlePwInput);
    });

    // 4. 가입 버튼 상태 업데이트
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

    // [최종 가입 제출 핸들러]
    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const username = document.getElementById(`${prefix}-id`).value;
        const password = document.getElementById(`${prefix}-pw`).value;
        const name = document.getElementById(`${prefix}-name`).value;
        
        // 폰번호 조합
        const phoneInputs = document.querySelectorAll(state.currentType === "BUYER" ? "#buyer-form .phone" : "#seller-form .phone");
        const phonePrefix = state.currentType === "BUYER" 
            ? document.querySelector("#buyer-form .select").value 
            : document.getElementById("seller-phone-prefix").value;
        const phoneNumber = `${phonePrefix}${phoneInputs[0].value}${phoneInputs[1].value}`;

        const signupData = {
            username,
            password,
            name,
            phone_number: phoneNumber,
            user_type: state.currentType
        };

        if (state.currentType === "SELLER") {
            signupData.company_registration_number = document.getElementById("seller-num").value;
            signupData.store_name = document.getElementById("store-name").value;
        }

        try {
            const res = await fetch(`${BASE_URL}/accounts/signup/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });
            
            if (res.ok) {
                alert("호두마켓에 오신 것을 환영합니다! 가입이 완료되었습니다. :)");
                location.href = "login.html"; // 가입 성공 시 로그인 페이지로 이동
            } else {
                const data = await res.json();
                alert(data.error || "가입에 실패했습니다.");
            }
        } catch (error) {
            alert("서버 요청 중 오류가 발생했습니다.");
        }
    };

    submitBtn.addEventListener("click", handleSignupSubmit);
    document.querySelectorAll("input").forEach(i => i.addEventListener("input", updateButtonState));
    agreeCheck.addEventListener("change", updateButtonState);
};

window.onload = initSignup;