// CloudJet MSA API 통신 모듈
// 인증, 항공편검색, 예약, 결제 등 모든 백엔드 서비스와의 통신 담당

const API_BASE_URL = window.API_BASE_URL || window.CONFIG?.API_BASE_URL || 'http://localhost:5000/api';

console.log('API Base URL 설정됨:', API_BASE_URL);

// 공통 API 호출 함수 (JWT 토큰 자동 처리)
async function safeApiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    // 인증 토큰 추가
    const user = Storage.getUser();
    if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    try {
        console.log(`API 호출: ${config.method || 'GET'} ${url}`);
        
        const response = await fetch(url, config);
        
        // Content-Type 확인
        const contentType = response.headers.get('content-type');
        
        // HTML 응답인 경우 (에러 페이지 등)
        if (contentType && contentType.includes('text/html')) {
            const htmlText = await response.text();
            console.error('HTML 응답 받음:', {
                url: url,
                status: response.status,
                contentType: contentType,
                htmlContent: htmlText.substring(0, 500)
            });
            throw new Error('서버에서 HTML 응답을 받았습니다. API 서버가 정상적으로 실행되지 않았을 수 있습니다.');
        }
        
        // 빈 응답 처리
        let data;
        const responseText = await response.text();
        
        console.log('원본 응답 텍스트:', {
            url: url,
            status: response.status,
            contentType: contentType,
            responseLength: responseText.length,
            responseText: responseText.substring(0, 500)
        });
        
        if (!responseText) {
            if (response.ok) {
                data = { success: true };
            } else {
                throw new Error(`HTTP ${response.status}: 서버 응답이 비어있습니다.`);
            }
        } else {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON 파싱 오류:', {
                    parseError: parseError.message,
                    responseText: responseText,
                    url: url,
                    status: response.status
                });
                throw new Error(`서버 오류: ${response.status} ${response.statusText}: Failed to decode JSON object: ${parseError.message}`);
            }
        }
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log(`API 응답:`, data);
        return data;
        
    } catch (error) {
        console.error('API 호출 오류:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('네트워크 연결 오류: API 서버에 접속할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        }
        
        throw error;
    }
}

// ============================================
// 인증 관련 API
// ============================================

const AuthAPI = {
    async signup(userData) {
        return await safeApiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    async login(credentials) {
        return await safeApiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
};

// 항공편 검색 서비스 API (포트 5002)

const FlightAPI = {
    async search(searchParams) {
        const queryString = new URLSearchParams(searchParams).toString();
        return await safeApiCall(`/flights/search?${queryString}`);
    },
    
    async getAirports() {
        return await safeApiCall('/airports');
    },
    
    async getPromotions() {
        return await safeApiCall('/promotions');
    },
    
    async getFeatured() {
        return await safeApiCall('/flights/featured');
    }
};

// ============================================
// 예약 관련 API  
// ============================================

const BookingAPI = {
    async create(bookingData) {
        return await safeApiCall('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },
    
    async getUserBookings() {
        return await safeApiCall('/bookings');
    },
    
    async getByNumber(bookingNumber) {
        return await safeApiCall(`/bookings/${bookingNumber}`);
    },
    
    async cancel(bookingNumber) {
        return await safeApiCall(`/bookings/${bookingNumber}/cancel`, {
            method: 'POST'
        });
    },
    
    async getOccupiedSeats(scheduleId) {
        return await safeApiCall(`/bookings/occupied-seats/${scheduleId}`);
    }
};

// ============================================
// 사용자 관련 API
// ============================================

const UserAPI = {
    async getProfile() {
        return await safeApiCall('/user/profile');
    },
    
    async updateProfile(profileData) {
        return await safeApiCall('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
};

// ============================================
// 헬스체크 API
// ============================================

const HealthAPI = {
    async checkAll() {
        return await safeApiCall('/health');
    },
    
    async checkService(serviceName) {
        return await safeApiCall(`/${serviceName}/health`);
    }
};

// ============================================
// 결제 API
// ============================================

const PaymentAPI = {
    async initPayment(payload) {
        return await safeApiCall('/payments/init', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },
    async attachBooking(orderId, bookingId) {
        return await safeApiCall('/payments/attach-booking', {
            method: 'POST',
            body: JSON.stringify({ orderId, bookingId })
        });
    }
};

// ============================================
// 전역 API 객체 (기존 코드 호환성을 위해)
// ============================================

window.api = {
    // 인증
    signup: AuthAPI.signup,
    login: AuthAPI.login,
    
    // 항공편
    searchFlights: FlightAPI.search,
    getAirports: FlightAPI.getAirports,
    getPromotions: FlightAPI.getPromotions,
    
    // 예약
    createBooking: BookingAPI.create,
    getUserBookings: BookingAPI.getUserBookings,
    getBookingByNumber: BookingAPI.getByNumber,
    cancelBooking: BookingAPI.cancel,
    getOccupiedSeats: BookingAPI.getOccupiedSeats,
    
    // 사용자
    getUserProfile: UserAPI.getProfile,
    updateUserProfile: UserAPI.updateProfile,
    
    // 헬스체크
    checkHealth: HealthAPI.checkAll
};

// ============================================
// 기존 함수들을 새로운 API로 변경
// ============================================

// 로그인 함수 (auth.js에서 사용)
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    try {
        const result = await AuthAPI.login({ email, password });
        
        if (result.token) {
            const userData = {
                ...result.user,
                token: result.token
            };
            
            Storage.setUser(userData);
            currentUser = userData;
            
            alert('로그인되었습니다.');
            closeModal('loginModal');
            updateAuthUI();
        } else {
            throw new Error('토큰을 받지 못했습니다.');
        }
    } catch (error) {
        alert(`로그인 오류: ${error.message}`);
        console.error('로그인 오류:', error);
    }
}

// 회원가입 함수 (auth.js에서 사용)
async function signup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const phone = document.getElementById('signupPhone').value.trim();
    const birthDate = document.getElementById('signupBirthDate').value;
    
    // 유효성 검사
    if (!name || !email || !password || !phone || !birthDate) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (password.length < 6) {
        alert('비밀번호는 6자 이상이어야 합니다.');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }
    
    try {
        const userData = {
            name,
            email,
            password,
            phone,
            birthDate
        };
        
        const result = await AuthAPI.signup(userData);
        
        if (result.success) {
            alert('회원가입이 완료되었습니다. 로그인해주세요.');
            closeModal('signupModal');
            showLoginModal();
        } else {
            throw new Error('회원가입 처리 중 오류가 발생했습니다.');
        }
    } catch (error) {
        alert(`회원가입 오류: ${error.message}`);
        console.error('회원가입 오류:', error);
    }
}

// 항공편 검색 함수 (flight.js에서 사용)
async function searchFlights() {
    const departure = document.getElementById('departure').value;
    const arrival = document.getElementById('arrival').value;
    const departureDate = document.getElementById('departureDate').value;
    const passengers = document.getElementById('passengers').value;

    // 유효성 검사
    if (!departureDate) {
        alert('출발일을 선택해주세요.');
        return;
    }

    if (departure === arrival) {
        alert('출발지와 도착지가 같을 수 없습니다.');
        return;
    }

    // 검색 결과 페이지로 이동
    hideAllPages();
    document.getElementById('searchResultsPage').style.display = 'block';
    document.getElementById('searchLoading').style.display = 'block';
    document.getElementById('flightList').style.display = 'none';

    try {
        const searchParams = {
            departure,
            arrival,
            date: departureDate
        };
        
        console.log('항공편 검색 시작:', searchParams);
        const result = await FlightAPI.search(searchParams);
        console.log('검색 결과:', result);
        
        displaySearchResults(result.flights || [], departure, arrival, departureDate, passengers);
        
    } catch (error) {
        console.error('항공편 검색 오류:', error);
        document.getElementById('searchLoading').style.display = 'none';
        document.getElementById('flightList').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: #e74c3c; font-size: 18px; margin-bottom: 1rem;">항공편 검색 중 오류가 발생했습니다</p>
                <p style="color: #666; margin-bottom: 2rem;">${error.message}</p>
                <div>
                    <button class="btn btn-primary" onclick="showHome()" style="margin-right: 1rem;">다시 검색</button>
                    <button class="btn btn-outline" onclick="checkApiHealth()">서버 상태 확인</button>
                </div>
            </div>
        `;
        document.getElementById('flightList').style.display = 'block';
    }
}

// 예약 완료 함수 (booking.js에서 사용)
async function completeBooking() {
    if (!bookingData.paymentMethod) {
        alert('결제 수단을 선택해주세요.');
        return;
    }
    
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    try {
        const bookingRequest = {
            scheduleId: selectedFlight.schedule_id,
            passengers: bookingData.passengers,
            seats: bookingData.seats,
            contactInfo: bookingData.contactInfo,
            paymentMethod: bookingData.paymentMethod,
            totalAmount: selectedFlight.price * bookingData.passengers.length
        };
        
        console.log('예약 요청:', bookingRequest);
        const result = await BookingAPI.create(bookingRequest);
        
        if (result.success) {
            // 예약 완료 표시
            const content = document.getElementById('bookingContent');
            if (content) {
                content.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <div style="font-size: 48px; color: #27ae60; margin-bottom: 1rem;">✓</div>
                        <h2 style="color: #27ae60;">예약이 완료되었습니다!</h2>
                        <div style="margin: 2rem 0; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
                            <p style="margin: 0 0 1rem 0; font-size: 18px;">
                                예약번호: <strong style="font-size: 24px; color: #057beb;">${result.bookingNumber}</strong>
                            </p>
                            <p style="margin: 0; color: #666;">
                                예약 확인서가 <strong>${bookingData.contactInfo.email}</strong>로 발송되었습니다.
                            </p>
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <button class="btn btn-primary" onclick="showHome()">홈으로</button>
                            <button class="btn btn-outline" onclick="loadUserBookings()">예약 조회</button>
                        </div>
                    </div>
                `;
            }
            
            // 예약 데이터 초기화
            bookingData = {
                flight: null,
                passengers: [],
                seats: [],
                contactInfo: {}
            };
            selectedFlight = null;
        }
        
    } catch (error) {
        alert(`예약 처리 중 오류가 발생했습니다: ${error.message}`);
        console.error('예약 오류:', error);
    }
}

// 사용자 예약 목록 로드
async function loadUserBookings() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    try {
        const result = await BookingAPI.getUserBookings();
        
        const bookingListContent = document.getElementById('bookingListContent');
        const myBookingList = document.getElementById('myBookingList');
        
        if (result.bookings && result.bookings.length > 0) {
            const bookingsHTML = result.bookings.map(booking => `
                <div class="booking-item" style="margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h4 style="margin: 0 0 0.5rem 0; color: #057beb;">예약번호: ${booking.booking_number}</h4>
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                예약일: ${new Date(booking.created_at).toLocaleDateString('ko-KR')}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <span class="status-badge ${booking.status.toLowerCase()}" style="
                                padding: 0.25rem 0.75rem; 
                                border-radius: 15px; 
                                font-size: 12px; 
                                color: white;
                                background: ${booking.status === 'CONFIRMED' ? '#27ae60' : '#e74c3c'};
                            ">
                                ${booking.status === 'CONFIRMED' ? '예약확정' : booking.status === 'CANCELLED' ? '취소됨' : '완료'}
                            </span>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <strong>${booking.departure_name} → ${booking.arrival_name}</strong>
                            <p style="margin: 0.25rem 0; color: #666;">${booking.flight_id} | ${booking.airline}</p>
                            <p style="margin: 0; color: #666;">
                                ${new Date(booking.flight_date).toLocaleDateString('ko-KR')} ${booking.departure_time}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #057beb;">
                                ₩${booking.total_amount.toLocaleString()}
                            </p>
                            <p style="margin: 0.25rem 0; color: #666;">
                                승객 ${booking.passengers.length}명
                            </p>
                        </div>
                    </div>
                    
                    ${booking.status === 'CONFIRMED' ? `
                        <div style="text-align: right;">
                            <button class="btn btn-outline btn-sm" onclick="cancelBookingAPI('${booking.booking_number}')" style="
                                padding: 0.5rem 1rem; 
                                font-size: 14px; 
                                color: #e74c3c; 
                                border-color: #e74c3c;
                            ">
                                예약 취소
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
            
            if (bookingListContent) bookingListContent.innerHTML = bookingsHTML;
            if (myBookingList) myBookingList.innerHTML = bookingsHTML;
            
        } else {
            const noBookingsHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <p style="color: #666; font-size: 18px;">예약 내역이 없습니다.</p>
                    <button class="btn btn-primary" onclick="showHome()">항공편 검색하기</button>
                </div>
            `;
            if (bookingListContent) bookingListContent.innerHTML = noBookingsHTML;
            if (myBookingList) myBookingList.innerHTML = noBookingsHTML;
        }
        
    } catch (error) {
        console.error('예약 목록 로드 오류:', error);
        alert(`예약 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }
}

// 예약 취소 함수 - 향상된 디버깅
async function cancelBookingAPI(bookingNumber) {
    if (!confirm('정말 예약을 취소하시겠습니까?\n취소 수수료가 발생할 수 있습니다.')) {
        return;
    }
    
    try {
        console.log('예약 취소 시작:', bookingNumber);
        console.log('현재 토큰:', Storage.getUser()?.token ? '있음' : '없음');
        
        const result = await BookingAPI.cancel(bookingNumber);
        console.log('예약 취소 응답:', result);
        
        if (result.success) {
            alert('예약이 취소되었습니다.');
            loadUserBookings();
        } else {
            alert('예약 취소 실패: ' + (result.message || '알 수 없는 오류'));
        }
        
    } catch (error) {
        console.error('예약 취소 오류 상세:', {
            message: error.message,
            stack: error.stack,
            bookingNumber: bookingNumber
        });
        alert(`예약 취소 중 오류가 발생했습니다: ${error.message}`);
    }
}

// 프로모션 로드 함수
async function loadPromotions() {
    try {
        const result = await FlightAPI.getPromotions();
        
        if (result.promotions && result.promotions.length > 0) {
            const promotionGrid = document.getElementById('promotionGrid');
            if (promotionGrid) {
                promotionGrid.innerHTML = result.promotions.map(promo => `
                    <div class="promotion-card" onclick="selectPromotion('${promo.departure_airport}', '${promo.arrival_airport}', ${promo.current_price})">
                        <h3>${promo.departure_city} → ${promo.arrival_city}</h3>
                        <div class="promotion-price">
                            <span class="original-price">₩${promo.base_price.toLocaleString()}</span>
                            <span class="discount-price">₩${promo.current_price.toLocaleString()}</span>
                        </div>
                        <span class="discount-badge">${promo.discount_percent}% 할인</span>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">즉시 예약</button>
                    </div>
                `).join('');
            }
        } else {
            loadHardcodedPromotions();
        }
    } catch (error) {
        console.error('프로모션 로드 오류:', error);
        loadHardcodedPromotions();
    }
}

// 서버 상태 확인 함수 (디버깅용)
async function checkApiHealth() {
    try {
        console.log('API 헬스체크 시작...');
        const health = await HealthAPI.checkAll();
        console.log('헬스체크 결과:', health);
        
        // 알람 제거 - 콘솔에만 로그 출력
        if (health.status === 'healthy') {
            console.log('✅ 모든 서비스가 정상 작동 중입니다.');
        } else {
            console.warn(`⚠️ 서비스 상태: ${health.status} - 일부 서비스에 문제가 있을 수 있습니다.`);
        }
        
        return health;
    } catch (error) {
        console.error('헬스체크 오류:', error);
        // 에러 시에도 알람 대신 콘솔 로그만
        console.warn(`❌ 서버 상태 확인 실패: ${error.message}`);
        return null;
    }
}

// 공항 목록 로드 함수
async function loadAirports() {
    try {
        const result = await FlightAPI.getAirports();
        
        if (result.airports && result.airports.length > 0) {
            // 공항 데이터를 전역 변수에 저장
            window.airportsData = result.airports;
            
            // 드롭다운에 공항 옵션 추가
            const departureSelect = document.getElementById('departure');
            const arrivalSelect = document.getElementById('arrival');
            
            if (departureSelect && arrivalSelect) {
                const airportOptions = result.airports.map(airport => 
                    `<option value="${airport.airport_code}">${airport.airport_name} (${airport.airport_code})</option>`
                ).join('');
                
                departureSelect.innerHTML = '<option value="">출발지 선택</option>' + airportOptions;
                arrivalSelect.innerHTML = '<option value="">도착지 선택</option>' + airportOptions;
            }
        }
    } catch (error) {
        console.error('공항 목록 로드 오류:', error);
        // 백업 공항 데이터 사용
        loadHardcodedAirports();
    }
}

// 하드코딩된 공항 데이터 (백업용)
function loadHardcodedAirports() {
    const airports = [
        { airport_code: 'ICN', airport_name: '인천국제공항', city: '서울', country: '한국' },
        { airport_code: 'GMP', airport_name: '김포국제공항', city: '서울', country: '한국' },
        { airport_code: 'NRT', airport_name: '나리타국제공항', city: '도쿄', country: '일본' },
        { airport_code: 'KIX', airport_name: '간사이국제공항', city: '오사카', country: '일본' },
        { airport_code: 'BKK', airport_name: '수완나품국제공항', city: '방콕', country: '태국' }
    ];
    
    window.airportsData = airports;
    
    const departureSelect = document.getElementById('departure');
    const arrivalSelect = document.getElementById('arrival');
    
    if (departureSelect && arrivalSelect) {
        const airportOptions = airports.map(airport => 
            `<option value="${airport.airport_code}">${airport.airport_name} (${airport.airport_code})</option>`
        ).join('');
        
        departureSelect.innerHTML = '<option value="">출발지 선택</option>' + airportOptions;
        arrivalSelect.innerHTML = '<option value="">도착지 선택</option>' + airportOptions;
    }
}

// 프로모션 로드 함수
async function loadPromotions() {
    try {
        // API에서 할인 정보가 있는 항공편 데이터 가져오기
        const result = await FlightAPI.getFeatured();
        
        if (result.flights && result.flights.length > 0) {
            displayPromotions(result.flights);
        } else {
            // 백업 하드코딩 데이터 사용
            loadHardcodedPromotions();
        }
    } catch (error) {
        console.error('프로모션 로드 오류:', error);
        loadHardcodedPromotions();
    }
}

// 프로모션 표시 함수
function displayPromotions(flights) {
    const promotionGrid = document.getElementById('promotionGrid');
    if (!promotionGrid) return;
    
    promotionGrid.innerHTML = flights.map(flight => {
        const discountPercent = flight.discount_percentage || 0;
        const originalPrice = flight.base_price || flight.price;
        const discountedPrice = flight.current_price || flight.price;
        
        // 할인이 있는 항공편의 날짜 계산 (내일부터 7일 이내)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const promoDate = new Date(tomorrow);
        promoDate.setDate(promoDate.getDate() + Math.floor(Math.random() * 7)); // 1-7일 사이 랜덤
        const promoDateStr = promoDate.toISOString().split('T')[0];
        
        return `
            <div class="promotion-card" onclick="selectPromotion('${flight.departure_airport}', '${flight.arrival_airport}', '${promoDateStr}', ${discountedPrice})">
                <h3>${flight.departure_name} → ${flight.arrival_name}</h3>
                <div class="promotion-price">
                    ${discountPercent > 0 ? `<span class="original-price">₩${originalPrice.toLocaleString()}</span>` : ''}
                    <span class="discount-price">₩${discountedPrice.toLocaleString()}</span>
                </div>
                ${discountPercent > 0 ? `<span class="discount-badge">${discountPercent}% 할인</span>` : ''}
                <div class="promo-date">특가 날짜: ${promoDateStr}</div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">즉시 예약</button>
            </div>
        `;
    }).join('');
}

// 특가 항공편 선택 함수
function selectPromotion(departureAirport, arrivalAirport, promoDate, price) {
    console.log('특가 항공편 선택:', { departureAirport, arrivalAirport, promoDate, price });
    
    // 검색 드롭다운 설정
    document.getElementById('departure').value = departureAirport;
    document.getElementById('arrival').value = arrivalAirport;
    document.getElementById('departureDate').value = promoDate;
    
    // 항공편 검색 수행
    searchFlights();
}

// 하드코딩된 프로모션 (백업용) - 날짜 정보 추가
function loadHardcodedPromotions() {
    const promotions = [
        {
            departure_airport: 'ICN',
            arrival_airport: 'NRT',
            departure_city: '서울',
            arrival_city: '도쿄',
            base_price: 320000,
            current_price: 224000,
            discount_percent: 30
        },
        {
            departure_airport: 'ICN',
            arrival_airport: 'KIX',
            departure_city: '서울',
            arrival_city: '오사카',
            base_price: 350000,
            current_price: 262500,
            discount_percent: 25
        },
        {
            departure_airport: 'ICN',
            arrival_airport: 'BKK',
            departure_city: '서울',
            arrival_city: '방콕',
            base_price: 450000,
            current_price: 360000,
            discount_percent: 20
        }
    ];

    const promotionGrid = document.getElementById('promotionGrid');
    if (promotionGrid) {
        promotionGrid.innerHTML = promotions.map(promo => {
            const promoDate = getPromoDate(); // 각 프로모션마다 다른 날짜
            return `
                <div class="promotion-card" onclick="selectPromotion('${promo.departure_airport}', '${promo.arrival_airport}', '${promoDate}', ${promo.current_price})">
                    <h3>${promo.departure_city} → ${promo.arrival_city}</h3>
                    <div class="promotion-price">
                        <span class="original-price">₩${promo.base_price.toLocaleString()}</span>
                        <span class="discount-price">₩${promo.current_price.toLocaleString()}</span>
                    </div>
                    <span class="discount-badge">${promo.discount_percent}% 할인</span>
                    <div class="promo-date" style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">특가 날짜: ${promoDate}</div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">즉시 예약</button>
                </div>
            `;
        }).join('');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('CloudJet MSA 시스템 초기화 중...');
    
    // 공항 목록 로드
    loadAirports();
    
    // 프로모션 로드
    loadPromotions();
    
    console.log('프론트엔드 초기화 완료');
    
    // 헬스체크는 디버깅용으로만 사용 (비활성화)
    // checkApiHealth().catch(error => {
    //     console.warn('초기 헬스체크 실패:', error.message);
    // });
});

// 날짜 생성 함수 추가
function getPromoDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1 + Math.floor(Math.random() * 7));
    return tomorrow.toISOString().split('T')[0];
}

// 전역 접근을 위해 window 객체에 추가
window.selectPromotion = selectPromotion;
window.getPromoDate = getPromoDate;

console.log('MSA API 모듈 로드 완료');
