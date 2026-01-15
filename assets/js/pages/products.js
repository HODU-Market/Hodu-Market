document.addEventListener('DOMContentLoaded', () => {
    const priceElement = document.querySelector('.price');
    const unitPrice = priceElement ? parseInt(priceElement.dataset.price, 10) : 0;
    
    const quantityInput = document.querySelector('.qty-control__input');
    const totalCount = document.querySelector('.total-count');
    const totalMoney = document.querySelector('.total-money');

    const btnMinus = document.querySelector('.qty-control__btn--minus');
    const btnPlus = document.querySelector('.qty-control__btn--plus');

    function startTimer() {
        const timerElement = document.getElementById('realtime-timer');
        if (!timerElement) {
            return;
        }
    
        function updateTimer() {
            const now = new Date();
            
            // 오늘 자정 시간 설정
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
    
            // 남은 시간 계산 (밀리초 단위)
            const diff = midnight - now;
    
            if (diff <= 0) {
                timerElement.textContent = "00:00:00";
                return;
            }
    
            // 시, 분, 초 계산
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
    
            // 두 자리 수 형식으로 맞춤 (예: 05:09:01)
            const displayHours = String(hours).padStart(2, '0');
            const displayMinutes = String(minutes).padStart(2, '0');
            const displaySeconds = String(seconds).padStart(2, '0');
    
            timerElement.textContent = `${displayHours}:${displayMinutes}:${displaySeconds}`;
        }
    
        // 초기 실행 후 1초마다 반복 실행
        updateTimer();
        setInterval(updateTimer, 1000);

    }

    startTimer();
    

    function updateResult() {
        if (!quantityInput || !totalCount || !totalMoney) {
            return;
        }
        const count = parseInt(quantityInput.value, 10) || 1;
        totalCount.textContent = count;
        totalMoney.textContent = (unitPrice * count).toLocaleString();
    }

    if (priceElement && quantityInput && totalCount && totalMoney) {
        updateResult();
        if (btnPlus) {
            btnPlus.addEventListener('click', updateResult);
        }
        if (btnMinus) {
            btnMinus.addEventListener('click', updateResult);
        }
    }


    const tabItems = document.querySelectorAll('.tab-item');
    const contentSections = document.querySelectorAll('.content-item');
    const tabNav = document.querySelector('.product-tabs');


    if (tabItems.length && contentSections.length && tabNav) {
        tabItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.getAttribute('data-tab');
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // 상단 고정된 탭 메뉴의 높이 측정
                    const navHeight = tabNav.offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0
    };

    if (!contentSections.length || !tabItems.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                tabItems.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-tab') === id) {
                        btn.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    contentSections.forEach(section => observer.observe(section));

    

});