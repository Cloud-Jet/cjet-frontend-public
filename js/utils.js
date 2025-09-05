// utils.js - 유틸리티 함수들

// 날짜 포맷팅
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 시간 포맷팅
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

// 가격 포맷팅
function formatPrice(price) {
    return '₩' + price.toLocaleString();
}

// 예약 번호 생성
function generateBookingNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Storage가 정의되어 있는지 확인
    let counter = 1;
    if (typeof Storage !== 'undefined' && Storage.getBookingCounter) {
        counter = Storage.getBookingCounter() + 1;
    } else {
        // Storage가 없는 경우 랜덤 번호 사용
        counter = Math.floor(Math.random() * 9999) + 1;
    }
    
    return `CJ${year}${month}${day}${String(counter).padStart(4, '0')}`;
}

// 랜덤 ID 생성
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// 이메일 유효성 검사
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 전화번호 포맷팅
function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
        return match[1] + '-' + match[2] + '-' + match[3];
    }
    return phone;
}

// 생년월일 유효성 검사
function validateBirthDate(birthDate) {
    const date = new Date(birthDate);
    const now = new Date();
    return date < now && date > new Date('1900-01-01');
}

// 비행 시간 계산 (시뮬레이션)
function calculateFlightDuration(departure, arrival) {
    const durations = {
        'ICN-NRT': '2h 45m',
        'ICN-KIX': '2h 30m',
        'ICN-BKK': '5h 30m',
        'ICN-SYD': '10h 20m',
        'ICN-LAX': '11h 30m',
        'ICN-CDG': '12h 45m',
        'GMP-NRT': '2h 50m',
        'GMP-KIX': '2h 35m',
        'NRT-ICN': '2h 45m',
        'KIX-ICN': '2h 30m',
        'BKK-ICN': '5h 30m',
        'SYD-ICN': '10h 20m',
        'LAX-ICN': '11h 30m',
        'CDG-ICN': '12h 45m'
    };
    
    const key = `${departure}-${arrival}`;
    return durations[key] || '3h 00m';
}

// 공항 이름 가져오기
function getAirportName(code) {
    const airports = {
        'ICN': '서울/인천',
        'GMP': '서울/김포',
        'NRT': '도쿄/나리타',
        'KIX': '오사카/간사이',
        'BKK': '방콕',
        'SYD': '시드니',
        'LAX': '로스앤젤레스',
        'CDG': '파리'
    };
    
    return airports[code] || code;
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DOM 요소 안전하게 가져오기
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

// 안전한 값 가져오기 (null/undefined 체크)
function safeGetValue(element, defaultValue = '') {
    return element ? element.value : defaultValue;
}

// 날짜 유효성 검사
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// 문자열이 비어있는지 체크
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

// 숫자 유효성 검사
function isValidNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}

// 로컬 스토리지 안전하게 사용
function safeLocalStorage() {
    try {
        return typeof localStorage !== 'undefined' && localStorage;
    } catch (e) {
        console.warn('localStorage not available:', e);
        return null;
    }
}
