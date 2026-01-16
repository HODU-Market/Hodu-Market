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

    const getFieldOrder = () => {
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const order = [`${prefix}-id`, `${prefix}-pw`, `${prefix}-pw-check`, `${prefix}-name` ];
        if (state.currentType === "SELLER") order.push("seller-num", "store-name");
        return order;
    };

    const setMessage = (inputId, errorId, message, type, showBorder = true) => {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (!errorEl) return;

        errorEl.classList.remove("error", "success");
        inputEl?.classList.remove("error", "success");

        if (type === "error") {
            if (showBorder) inputEl?.classList.add("error");
            errorEl.classList.add("error");
            errorEl.textContent = message;
        } else if (type === "success") {
            inputEl?.classList.add("success");
            errorEl.classList.add("success");
            errorEl.textContent = message;
        } else {
            errorEl.textContent = "";
        }
        errorEl.style.display = type ? "block" : "none";
    };

    const checkSequentialInput = (currentId) => {
        const order = getFieldOrder();
        const currentIndex = order.indexOf(currentId);
        for (let i = 0; i < currentIndex; i++) {
            const prevInput = document.getElementById(order[i]);
            const prevErrorId = `${order[i]}-error`;
            if (prevInput && !prevInput.value.trim()) {
                setMessage(order[i], prevErrorId, "필수 정보입니다.", "error", false);
                prevInput.focus();
                return false;
            }
        }
        return true;
    };

    const validateIdFormat = (id) => /^[a-zA-Z0-9]{1,20}$/.test(id);
    const validatePwFormat = (pw) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&~])[A-Za-z\d@$!%*?&~]{8,}$/.test(pw);

    const checkId = async (isButtonClick = false) => {
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const inputId = `${prefix}-id`;
        const errorId = `${prefix}-id-error`;
        const username = document.getElementById(inputId).value;

        if (!isButtonClick) return;

        if (!username) {
            if (isButtonClick) setMessage(inputId, errorId, "아이디를 입력해주세요.", "error", false);
            return;
        }
        if (!validateIdFormat(username)) {
            setMessage(inputId, errorId, "20자 이내의 영문 소문자, 대문자, 숫자만 사용 가능합니다.", "error", true);
            state.isIdVerified = false;
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/accounts/validate-username/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            if (res.ok) {
                setMessage(inputId, errorId, "멋진 아이디네요 :)", "success");
                state.isIdVerified = true;
            } else {
                setMessage(inputId, errorId, "이미 사용 중인 아이디입니다.", "error", true);
                state.isIdVerified = false;
            }
        } catch (e) {
            setMessage(inputId, errorId, "서버 연결 실패", "error", false);
        }
        updateButtonState();
    };

    const checkPassword = (event) => {
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const pwInput = document.getElementById(`${prefix}-pw`);
        const pwCheckInput = document.getElementById(`${prefix}-pw-check`);
        const pwErrorId = `${prefix}-pw-error`;
        const pwCheckErrorId = `${prefix}-pw-check-error`;

        const pwStatusIcon = document.getElementById(state.currentType === "BUYER" ? "pw-status" : `${prefix}-pw-status`);
        const pwCheckIcon = document.getElementById(state.currentType === "BUYER" ? "pw-check-status" : `${prefix}-pw-check-status`);

        const pwValue = pwInput.value;
        const pwCheckValue = pwCheckInput.value;

        if (!pwValue && event?.type === 'blur') {
            setMessage(`${prefix}-pw`, pwErrorId, "필수 정보입니다.", "error", false);
        } else if (validatePwFormat(pwValue)) {
            pwStatusIcon?.classList.add("active");
            setMessage(`${prefix}-pw`, pwErrorId, "", null);
        } else {
            pwStatusIcon?.classList.remove("active");
            if (pwValue.length > 0) {
                setMessage(`${prefix}-pw`, pwErrorId, "8자 이상, 영문 대 소문자, 숫자, 특수문자를 사용하세요", "error", true);
            }
        }

        if (pwCheckValue) {
            if (pwValue === pwCheckValue) {
                setMessage(`${prefix}-pw-check`, pwCheckErrorId, "", null);
                pwCheckIcon?.classList.add("active");
            } else {
                setMessage(`${prefix}-pw-check`, pwCheckErrorId, "비밀번호가 일치하지 않습니다.", "error", true);
                pwCheckIcon?.classList.remove("active");
            }
        } else {
            setMessage(`${prefix}-pw-check`, pwCheckErrorId, "", null);
            pwCheckIcon?.classList.remove("active");
        }
        updateButtonState();
    };

    const updateButtonState = () => {
        const isAgree = agreeCheck.checked;
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const pw = document.getElementById(`${prefix}-pw`).value;
        const pwCheck = document.getElementById(`${prefix}-pw-check`).value;
        const isPwMatch = pw && pw === pwCheck && validatePwFormat(pw);
        const nameOk = document.getElementById(`${prefix}-name`).value.trim() !== "";

        if (state.currentType === "BUYER") {
            submitBtn.disabled = !(state.isIdVerified && isPwMatch && nameOk && isAgree);
        } else {
            const storeOk = document.getElementById("store-name").value.trim() !== "";
            submitBtn.disabled = !(state.isIdVerified && isPwMatch && nameOk && storeOk && state.isBusinessNumVerified && isAgree);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const formId = state.currentType === "BUYER" ? "buyer-form" : "seller-form";
        
        const phoneInputs = document.querySelectorAll(`#${formId} .phone`);
        const phonePrefix = state.currentType === "BUYER" 
            ? document.querySelector("#buyer-form .select").value 
            : document.getElementById("seller-phone-prefix").value;

        const signupData = {
            username: document.getElementById(`${prefix}-id`).value,
            password: document.getElementById(`${prefix}-pw`).value,
            name: document.getElementById(`${prefix}-name`).value,
            phone_number: `${phonePrefix}${phoneInputs[0].value}${phoneInputs[1].value}`,
        };

        if (state.currentType === "SELLER") {
            signupData.company_registration_number = document.getElementById("seller-num").value;
            signupData.store_name = document.getElementById("store-name").value;
        }

        const signupPath = state.currentType === "BUYER" ? "/accounts/buyer/signup/" : "/accounts/seller/signup/";

        try {
            const res = await fetch(`${BASE_URL}${signupPath}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });
            
            const data = await res.json();
            
            if (res.ok) {
                alert("호두마켓에 오신 것을 환영합니다! 회원가입이 완료되었습니다 :)");
                location.href = "login.html";
            } else {
                if (data.phone_number) {
                    setMessage(`${prefix}-phone-1`, `${prefix}-phone-error`, "이미 가입된 번호입니다.", "error", true);
                } else if (data.username) {
                    setMessage(`${prefix}-id`, `${prefix}-id-error`, "이미 존재하는 아이디입니다.", "error", true);
                } else {
                    alert("정보를 다시 확인해주세요.");
                }
            }
        } catch (error) {
            alert("서버 통신 오류");
        }
    };

    const setupListeners = () => {
        const prefix = state.currentType === "BUYER" ? "user" : "seller";
        const formId = state.currentType === "BUYER" ? "buyer-form" : "seller-form";

        document.querySelectorAll(`#${formId} input, #${formId} select`).forEach(input => {
            input.addEventListener("focus", () => checkSequentialInput(input.id || input.classList[0]));
            input.addEventListener("input", updateButtonState);

            if (input.type === "number") {
                input.addEventListener("input", (e) => {
                    let maxLength = 10;

                    if (input.id && input.id.includes("phone")) {
                        maxLength = 4;
                    }

                    if (e.target.value.length > maxLength) {
                        e.target.value = e.target.value.slice(0, maxLength);
                    }
                });
            }
        });

        const nameInput = document.getElementById(`${prefix}-name`);
        const nameErrorId = `${prefix}-name-error`;
        nameInput.addEventListener("blur", () => {
            if (!nameInput.value.trim()) {
                setMessage(`${prefix}-name`, nameErrorId, "필수 정보입니다.", "error", false);
            } else {
                setMessage(`${prefix}-name`, nameErrorId, "", null);
            }
        });

        const phoneInputs = document.querySelectorAll(`#${formId} .phone, #${formId} .select`);
        phoneInputs.forEach(input => {
            input.addEventListener("focus", () => {
                if (!nameInput.value.trim()) {
                    setMessage(`${prefix}-name`, nameErrorId, "필수 정보입니다.", "error", false);
                }
            });
        });

        const pwEl = document.getElementById(`${prefix}-pw`);
        const pwCheckEl = document.getElementById(`${prefix}-pw-check`);
        pwEl.addEventListener("input", checkPassword);
        pwEl.addEventListener("blur", checkPassword);
        pwCheckEl.addEventListener("input", checkPassword);
        pwCheckEl.addEventListener("blur", checkPassword);
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            forms.forEach(f => f.classList.remove("active"));
            tab.classList.add("active");
            forms[index].classList.add("active");
            state.currentType = index === 0 ? "BUYER" : "SELLER";
            setupListeners();
            updateButtonState();
        });
    });

    document.getElementById("user-check-btn")?.addEventListener("click", () => checkId(true));
    document.getElementById("seller-check-btn")?.addEventListener("click", () => checkId(true));
    agreeCheck.addEventListener("change", updateButtonState);
    
    submitBtn.addEventListener("click", handleSignup);

    setupListeners();
};

window.onload = initSignup;