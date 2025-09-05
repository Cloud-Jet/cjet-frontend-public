// app.js - 메인 애플리케이션 로직

// 전역 변수
let currentUser = null;
let selectedFlight = null;
let bookingData = {
    flight: null,
    passengers: [],
    seats: [],
    contactInfo: {}
};

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 날짜 기본값 설정
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const departureDateEl = document.getElementById('departureDate');
    if (departureDateEl) {
        departureDateEl.valueAsDate = tomorrow;
    }
    
    // 왕복/편도 토글
    document.querySelectorAll('input[name="tripType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const returnDateGroup = document.getElementById('returnDateGroup');
            if (returnDateGroup) {
                if (this.value === 'roundtrip') {
                    returnDateGroup.style.display = 'block';
                    const returnDate = new Date(tomorrow);
                    returnDate.setDate(returnDate.getDate() + 7);
                    const returnDateEl = document.getElementById('returnDate');
                    if (returnDateEl) {
                        returnDateEl.valueAsDate = returnDate;
                    }
                } else {
                    returnDateGroup.style.display = 'none';
                }
            }
        });
    });

    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = Storage.getUser();
    if (savedUser) {
        currentUser = savedUser;
        updateAuthUI();
    }

    // 프로모션 항공편 로드
    loadPromotions();
    
    // 인기 노선 로드
    loadPopularRoutes();
    
});

// 프로모션 항공편 로드 - API 호출로 바꿄
async function loadPromotions() {
    try {
        const result = await FlightAPI.getFeatured();
        const promotions = result.flights || [];
        
        const promotionGrid = document.getElementById('promotionGrid');
        if (promotionGrid) {
            if (promotions.length > 0) {
                promotionGrid.innerHTML = promotions.map(promo => `
                    <div class="promotion-card" onclick="selectPromotion('${promo.departureAirport}', '${promo.arrivalAirport}', ${promo.price}, '${promo.date}')">
                        <div class="special-offer-badge">특가 ${promo.discount_percentage}%</div>
                        <h3>${getAirportName(promo.departureAirport)} → ${getAirportName(promo.arrivalAirport)}</h3>
                        <div class="promotion-route">
                            <span class="flight-number">${promo.flightId}</span>
                            <span class="flight-time">${promo.departureTime} - ${promo.arrivalTime}</span>
                        </div>
                        <div class="promotion-price">
                            <span class="original-price">₩${promo.original_price.toLocaleString()}</span>
                            <span class="discount-price">₩${promo.price.toLocaleString()}</span>
                        </div>
                        <span class="discount-badge">${promo.discount_percentage}% 할인</span>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">즉시 예약</button>
                    </div>
                `).join('');
            } else {
                promotionGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #666;">
                        현재 진행 중인 특가 항공편이 없습니다.
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Failed to load featured flights:', error);
        
        // 오류 시 기본 데이터 표시
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        const promotions = [
            {
                id: 'CJ002',
                route: '서울 → 도쿄',
                originalPrice: 320000,
                discountPrice: 224000,
                discount: 30,
                departure: 'ICN',
                arrival: 'NRT',
                date: tomorrow.toISOString().split('T')[0]
            },
            {
                id: 'CJ003',
                route: '서울 → 오사카',
                originalPrice: 350000,
                discountPrice: 262500,
                discount: 25,
                departure: 'ICN',
                arrival: 'KIX',
                date: dayAfterTomorrow.toISOString().split('T')[0]
            },
            {
                id: 'CJ004',
                route: '서울 → 방콕',
                originalPrice: 450000,
                discountPrice: 360000,
                discount: 20,
                departure: 'ICN',
                arrival: 'BKK',
                date: tomorrow.toISOString().split('T')[0]
            }
        ];

        const promotionGrid = document.getElementById('promotionGrid');
        if (promotionGrid) {
            promotionGrid.innerHTML = promotions.map(promo => `
                <div class="promotion-card" onclick="selectPromotion('${promo.departure}', '${promo.arrival}', ${promo.discountPrice}, '${promo.date}')">
                    <h3>${promo.route}</h3>
                    <div class="promotion-price">
                        <span class="original-price">₩${promo.originalPrice.toLocaleString()}</span>
                        <span class="discount-price">₩${promo.discountPrice.toLocaleString()}</span>
                    </div>
                    <span class="discount-badge">${promo.discount}% 할인</span>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">즉시 예약</button>
                </div>
            `).join('');
        }
    }
}

// 인기 노선 로드
async function loadPopularRoutes() {
    // 실제로는 data/routes.json을 fetch하지만, 로컬 실행을 위해 하드코딩
    const routes = [
        { rank: 1, name: '서울 → 도쿄', bookings: 156, rate: 85.2 },
        { rank: 2, name: '서울 → 오사카', bookings: 132, rate: 78.9 },
        { rank: 3, name: '서울 → 방콕', bookings: 98, rate: 72.1 },
        { rank: 4, name: '서울 → 시드니', bookings: 87, rate: 68.3 },
        { rank: 5, name: '서울 → 파리', bookings: 76, rate: 65.4 }
    ];

    const popularRoutes = document.getElementById('popularRoutes');
    if (popularRoutes) {
        popularRoutes.innerHTML = routes.map(route => `
            <div class="route-item">
                <span class="route-rank">${route.rank}</span>
                <div class="route-info">
                    <div class="route-name">${route.name}</div>
                    <div class="route-stats">예약 ${route.bookings}건 | 예약률 ${route.rate}%</div>
                </div>
            </div>
        `).join('');
    }
}

// 프로모션 선택 - 특정 날짜의 특가 항공편으로 바로 이동
function selectPromotion(departure, arrival, price, discountDate) {
    const departureEl = document.getElementById('departure');
    const arrivalEl = document.getElementById('arrival');
    const departureDateEl = document.getElementById('departureDate');
    
    if (departureEl) departureEl.value = departure;
    if (arrivalEl) arrivalEl.value = arrival;
    if (departureDateEl && discountDate) departureDateEl.value = discountDate;
    
    // 검색 실행
    searchFlights();
}

// 인증 UI 업데이트 - 수정된 버전
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const loggedInButtons = document.getElementById('loggedInButtons');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (loggedInButtons) loggedInButtons.style.display = 'flex';
        if (userName) userName.textContent = currentUser.name + '님';
        
        // 로그인 성공 후 대기 중인 액션이 있다면 실행
        if (window.pendingAction) {
            const action = window.pendingAction;
            window.pendingAction = null;
            action();
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (loggedInButtons) loggedInButtons.style.display = 'none';
    }
}

// 모달 외부 클릭시 닫기
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
