// modal.js - 모달 관리

// 모달 표시
function showModal(modalId) {
    closeAllModals();
    document.getElementById(modalId).style.display = 'flex';
}

// 모달 닫기
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 모든 모달 닫기
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// 로그인 모달
function showLoginModal() {
    showModal('loginModal');
}

// 회원가입 모달
function showSignupModal() {
    showModal('signupModal');
}

// 프로필 수정 모달 (구현 예정)
function showEditProfileModal() {
    alert('프로필 수정 기능은 준비중입니다.');
}

// 비밀번호 변경 모달 (구현 예정)
function showChangePasswordModal() {
    alert('비밀번호 변경 기능은 준비중입니다.');
}

// 예약 상세 모달 (추가 가능)
function showBookingDetailModal(bookingNumber) {
    // 예약 상세 정보를 모달로 표시
    const bookings = Storage.getBookings();
    const booking = bookings.find(b => b.bookingNumber === bookingNumber);
    
    if (booking) {
        // 모달 생성 및 표시 로직
        console.log('Booking details:', booking);
    }
}

// 알림 모달
function showAlert(title, message, type = 'info') {
    // 간단한 알림 모달 생성
    const alertModal = document.createElement('div');
    alertModal.className = 'modal';
    alertModal.style.display = 'flex';
    
    alertModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <p style="margin: 1rem 0;">${message}</p>
            <button class="btn btn-primary" onclick="this.closest('.modal').remove()">확인</button>
        </div>
    `;
    
    document.body.appendChild(alertModal);
}

// 확인 모달
function showConfirm(title, message, onConfirm) {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal';
    confirmModal.style.display = 'flex';
    
    confirmModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <p style="margin: 1rem 0;">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">취소</button>
                <button class="btn btn-primary" id="confirmBtn">확인</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    document.getElementById('confirmBtn').onclick = function() {
        onConfirm();
        confirmModal.remove();
    };
}
