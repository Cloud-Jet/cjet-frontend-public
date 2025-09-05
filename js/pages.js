// pages.js - 페이지 전환 관리

// 전역 showPage 함수 추가
function showPage(pageName) {
    console.log(`showPage 호출: ${pageName}`);
    
    switch(pageName) {
        case 'home':
            showHome();
            window.location.hash = '';
            break;
        case 'bookings':
            showBookingList();
            window.location.hash = 'bookings';
            break;
        case 'mypage':
            showMyPage();
            window.location.hash = 'mypage';
            break;
        default:
            showHome();
            window.location.hash = '';
    }
}

// 전역 접근을 위해 window 객체에 추가
window.showPage = showPage;

// 네비게이션 함수들 - 안전한 이벤트 처리
function navigateToHome(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    console.log('navigateToHome 호출');
    showHome();
}

function navigateToBookingList(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    console.log('navigateToBookingList 호출');
    showBookingList();
}

function navigateToMyPage(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    console.log('navigateToMyPage 호출');
    showMyPage();
}

// 모든 페이지 숨기기
function hideAllPages() {
    const pages = ['homePage', 'searchResultsPage', 'bookingProcessPage', 'myPage', 'bookingListPage'];
    pages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'none';
        }
    });
    
    // main 섹션도 숨기기 (다른 페이지를 보여줄 때)
    const main = document.querySelector('main');
    if (main) {
        main.style.display = 'block';
    }
}

// 홈 페이지 표시
function showHome() {
    console.log('=== showHome 호출 ===');
    showHomeInternal();
    
    // URL 업데이트
    if (window.location.hash !== '' && window.location.hash !== '#home') {
        history.pushState(null, '', '#');
    }
}

// 검색 결과 페이지 표시
function showSearchResults() {
    const bookingProcessPage = document.getElementById('bookingProcessPage');
    const searchResultsPage = document.getElementById('searchResultsPage');
    
    if (bookingProcessPage) {
        bookingProcessPage.style.display = 'none';
    }
    if (searchResultsPage) {
        searchResultsPage.style.display = 'block';
    }
    window.location.hash = 'search';
}

// 예약 목록 페이지 표시 - 수정된 버전
function showBookingList() {
    console.log('=== showBookingList 호출 ===');
    
    if (!isLoggedIn()) {
        console.log('로그인이 필요함');
        alert('로그인이 필요한 서비스입니다.');
        showLoginModal();
        window.pendingAction = showBookingList;
        return;
    }
    
    showBookingListInternal();
    
    // URL 업데이트
    if (window.location.hash !== '#bookings') {
        history.pushState(null, '', '#bookings');
    }
}

// 마이페이지 표시 - 수정된 버전
function showMyPage() {
    console.log('=== showMyPage 호출 ===');
    
    if (!isLoggedIn()) {
        console.log('로그인이 필요함');
        alert('로그인이 필요한 서비스입니다.');
        showLoginModal();
        window.pendingAction = showMyPage;
        return;
    }
    
    showMyPageInternal();
    
    // URL 업데이트
    if (window.location.hash !== '#mypage') {
        history.pushState(null, '', '#mypage');
    }
}

// 히스토리 관리를 위한 내부 함수들

// 홈 페이지 표시 (내부 함수)
function showHomeInternal() {
    console.log('=== showHomeInternal 호출 ===');
    hideAllPages();
    
    const otherPages = ['bookingListPage'];
    otherPages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'none';
        }
    });
    
    const main = document.querySelector('main');
    if (main) {
        main.style.display = 'block';
    }
    
    const homePage = document.getElementById('homePage');
    if (homePage) {
        homePage.style.display = 'block';
    }
}

// 예약 목록 페이지 표시 (내부 함수)
function showBookingListInternal() {
    console.log('=== showBookingListInternal 호출 ===');
    
    if (!isLoggedIn()) {
        console.log('로그인이 필요함');
        alert('로그인이 필요한 서비스입니다.');
        showLoginModal();
        window.pendingAction = () => {
            window.location.hash = 'bookings';
        };
        return;
    }
    
    hideAllPages();
    
    const main = document.querySelector('main');
    if (main) {
        main.style.display = 'none';
    }
    
    const bookingListPage = document.getElementById('bookingListPage');
    if (bookingListPage) {
        bookingListPage.style.display = 'block';
        loadUserBookings();
    }
}

// 마이페이지 표시 (내부 함수)
function showMyPageInternal() {
    console.log('=== showMyPageInternal 호출 ===');
    
    if (!isLoggedIn()) {
        console.log('로그인이 필요함');
        alert('로그인이 필요한 서비스입니다.');
        showLoginModal();
        window.pendingAction = () => {
            window.location.hash = 'mypage';
        };
        return;
    }
    
    hideAllPages();
    
    const myPage = document.getElementById('myPage');
    if (myPage) {
        myPage.style.display = 'block';
        loadUserProfile();
        loadUserRecentBookings();
    }
}

// 예약 취소 함수
function cancelBooking(bookingNumber) {
    if (confirm('정말로 예약을 취소하시겠습니까?')) {
        try {
            Storage.updateBookingStatus(bookingNumber, 'cancelled');
            alert('예약이 취소되었습니다.');
            // 현재 페이지 새로고침
            if (window.location.hash === '#bookings') {
                loadUserBookings();
            } else if (window.location.hash === '#mypage') {
                loadUserRecentBookings();
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('예약 취소 중 오류가 발생했습니다.');
        }
    }
}

// 마이페이지용 예약 목록 로드 (별칭)
async function loadMyBookings() {
    return await loadUserBookings();
}

// 사용자 프로필 로드
function loadUserProfile() {
    if (!currentUser) {
        console.error('currentUser is null');
        return;
    }
    
    const userInfoGrid = document.getElementById('userInfoGrid');
    if (userInfoGrid) {
        userInfoGrid.innerHTML = `
            <div class="info-item">
                <div class="info-label">이름</div>
                <div class="info-value">${currentUser.name || '정보 없음'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">이메일</div>
                <div class="info-value">${currentUser.email || '정보 없음'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">휴대폰</div>
                <div class="info-value">${currentUser.phone || '정보 없음'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">생년월일</div>
                <div class="info-value">${currentUser.birthDate || '정보 없음'}</div>
            </div>
        `;
    } else {
        console.error('userInfoGrid element not found');
    }
}

// 사용자 예약 목록 로드 - API 사용
async function loadUserBookings() {
    if (!currentUser) {
        console.error('currentUser is null');
        return;
    }
    
    try {
        const result = await BookingAPI.getUserBookings();
        const content = document.getElementById('bookingListContent');
        
        if (!content) {
            console.error('bookingListContent element not found');
            return;
        }
        
        if (!result.bookings || result.bookings.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <p style="color: #666; font-size: 18px;">예약 내역이 없습니다.</p>
                    <button class="btn btn-primary" onclick="showHome()">항공편 검색하기</button>
                </div>
            `;
        } else {
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
                    
                    <div style="margin-bottom: 1rem;">
                        <strong>승객 정보:</strong>
                        <div style="margin-top: 0.5rem;">
                            ${booking.passengers.map(p => `
                                <span style="
                                    display: inline-block; 
                                    margin: 0.25rem 0.5rem 0.25rem 0; 
                                    padding: 0.25rem 0.75rem; 
                                    background: #f8f9fa; 
                                    border-radius: 15px; 
                                    font-size: 14px;
                                ">
                                    ${p.name_kor} (${p.seat_number || '좌석 미배정'})
                                </span>
                            `).join('')}
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
            
            content.innerHTML = bookingsHTML;
        }
        
    } catch (error) {
        console.error('예약 목록 로드 오류:', error);
        const content = document.getElementById('bookingListContent');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <p style="color: #e74c3c;">예약 목록을 불러오는 중 오류가 발생했습니다.</p>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="loadUserBookings()">다시 시도</button>
                </div>
            `;
        }
    }
}

// 최근 예약 내역 로드 (마이페이지용) - 사용 안함
function loadUserRecentBookings() {
    // 마이페이지에서 예약 내역 제거
    const bookingList = document.getElementById('myBookingList');
    if (bookingList) {
        bookingList.style.display = 'none';
    }
}

// URL 해시 변경 감지 - 수정된 버전
window.addEventListener('hashchange', function(e) {
    console.log('hashchange 이벤트 발생, hash:', window.location.hash);
    handleRouteChange();
});

// 페이지 로드 시 초기 라우팅
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드 완료, 초기 라우팅 시작');
    handleRouteChange();
});

// 라우트 변경 처리 함수
function handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'home';
    console.log('현재 hash:', hash);
    
    // 현재 표시된 페이지 확인
    const currentPage = getCurrentVisiblePage();
    console.log('현재 표시된 페이지:', currentPage);
    
    // 이미 올바른 페이지가 표시되어 있으면 무시
    if (currentPage === hash) {
        console.log('이미 올바른 페이지가 표시됨');
        return;
    }
    
    switch(hash) {
        case 'home':
        case '':
            showHomeInternal();
            break;
        case 'search':
            // 검색 결과 유지
            if (document.getElementById('searchResultsPage').style.display !== 'block') {
                // 저장된 검색 데이터 복원 시도
                const searchData = restoreSearchState();
                if (searchData) {
                    restoreSearchResults(searchData);
                } else {
                    showHomeInternal();
                }
            }
            break;
        case 'booking':
            // 예약 프로세스 유지
            if (document.getElementById('bookingProcessPage').style.display !== 'block') {
                showHomeInternal();
            }
            break;
        case 'bookings':
            showBookingListInternal();
            break;
        case 'mypage':
            showMyPageInternal();
            break;
        default:
            showHomeInternal();
    }
}

// 현재 표시된 페이지 확인
function getCurrentVisiblePage() {
    if (document.getElementById('homePage').style.display === 'block') return 'home';
    if (document.getElementById('searchResultsPage').style.display === 'block') return 'search';
    if (document.getElementById('bookingProcessPage').style.display === 'block') return 'booking';
    if (document.getElementById('bookingListPage').style.display === 'block') return 'bookings';
    if (document.getElementById('myPage').style.display === 'block') return 'mypage';
    return 'unknown';
}
