const BASE_URL = "https://api.wenivops.co.kr/services/open-market";

window.handleLogin = async (loginType) => {
    const idInput = document.getElementById(`${loginType}-id`);
    const pwInput = document.getElementById(`${loginType}-pw`);
    const errorMsg = document.getElementById(`${loginType}-error`);

    const username = idInput.value.trim();
    const password = pwInput.value.trim();

    if (!username) {
        errorMsg.textContent = "아이디를 입력해 주세요.";
        errorMsg.style.display = "block";
        idInput.focus();
        return;
    }

    if (!password) {
        errorMsg.textContent = "비밀번호를 입력해 주세요.";
        errorMsg.style.display = "block";
        pwInput.focus();
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/accounts/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
                login_type: loginType.toUpperCase(),
            }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("access_token", data.access);
            if (data.refresh) {
                localStorage.setItem("refresh_token", data.refresh);
            }

            localStorage.setItem("user_info", JSON.stringify({
                user_type: loginType.toUpperCase()
            }));

            alert("로그인되었습니다!");
            location.href = "../index.html"; 
        } else {
            errorMsg.textContent = "아이디 또는 비밀번호가 일치하지 않습니다.";
            errorMsg.style.display = "block";
        }
    } catch (error) {
        errorMsg.textContent = "서버와의 연결에 실패했습니다.";
        errorMsg.style.display = "block";
    }
};

window.showForm = (type) => {
    document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(type).classList.add('active');
    
    const tabs = document.querySelectorAll('.tab');
    if (type === 'buyer') tabs[0].classList.add('active');
    else tabs[1].classList.add('active');

    document.querySelectorAll('.error-msg').forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
};