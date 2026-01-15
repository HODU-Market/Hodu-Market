const BASE_URL = "https://api.wenivops.co.kr/services/open-market";

// 2. 로그인 처리 기능
window.handleLogin = async (loginType) => {
    const idInput = document.getElementById(`${loginType}-id`);
    const pwInput = document.getElementById(`${loginType}-pw`);
    const errorMsg = document.getElementById(`${loginType}-error`);

    const username = idInput.value.trim();
    const password = pwInput.value.trim();

    // [유효성 검사 1] 아이디가 공란인 경우 (둘 다 공란일 때 포함)
    if (!username) {
        errorMsg.textContent = "아이디를 입력해 주세요.";
        errorMsg.style.display = "block";
        idInput.focus();
        return;
    }

    // [유효성 검사 2] 아이디는 입력했으나 비밀번호가 공란인 경우
    if (!password) {
        errorMsg.textContent = "비밀번호를 입력해 주세요.";
        errorMsg.style.display = "block";
        pwInput.focus();
        return;
    }

    // [API 통신] 아이디와 비밀번호가 모두 입력된 상태
    try {
        const res = await fetch(`${BASE_URL}/accounts/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
                login_type: loginType.toUpperCase(), // BUYER 또는 SELLER
            }),
        });

        const data = await res.json();

        if (res.ok) {
            // 로그인 성공 시 토큰과 유저 타입 저장
            localStorage.setItem("token", data.token);
            localStorage.setItem("userType", loginType.toUpperCase());
            
            // ✅ 성공 알림 후 메인 페이지(index.html)로 이동
            alert("로그인되었습니다!");
            location.href = "../index.html"; 
        } else {
            // [유효성 검사 3] 아이디/비밀번호가 서버 데이터와 일치하지 않을 경우
            errorMsg.textContent = "아이디 또는 비밀번호가 일치하지 않습니다.";
            errorMsg.style.display = "block";
        }
    } catch (error) {
        errorMsg.textContent = "서버와의 연결에 실패했습니다.";
        errorMsg.style.display = "block";
    }
};

// 탭 전환 시 에러 메시지 숨김 처리 (추가해두면 UX가 좋아집니다)
window.showForm = (type) => {
    document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(type).classList.add('active');
    
    const tabs = document.querySelectorAll('.tab');
    if (type === 'buyer') tabs[0].classList.add('active');
    else tabs[1].classList.add('active');

    // 다른 탭으로 넘어가면 이전 에러 메시지 삭제
    document.querySelectorAll('.error-msg').forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
};