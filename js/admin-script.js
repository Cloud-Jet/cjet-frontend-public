// Admin Script - 관리자 페이지 기능 (수정됨)

// 토큰 가져오기
const token = localStorage.getItem('token');

// 토큰 확인
if (!token) {
    alert('관리자 권한이 필요합니다.');
    window.location.href = 'index.html';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadFlights();
    loadAvailableSchedules();
    loadDiscounts();
    loadBookings();
    // 항공편+스케줄 추가 폼 이벤트
    const addFlightForm = document.getElementById('add-flight-form');
    if (addFlightForm) {
        addFlightForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            try {
                const flight = {
                    flight_id: document.getElementById('flight-number').value.trim(),
                    aircraft: document.getElementById('aircraft').value,
                    departure_airport: document.getElementById('departure').value,
                    arrival_airport: document.getElementById('arrival').value,
                    departure_time: document.getElementById('departure-time').value,
                    arrival_time: document.getElementById('arrival-time').value,
                    base_price: parseInt(document.getElementById('base-price').value, 10)
                };

                // 스케줄 입력값 수집
                const mode = document.getElementById('schedule-mode').value;
                const schedule = { mode };
                if (mode === 'single') {
                    schedule.date = document.getElementById('schedule-date').value;
                } else {
                    schedule.start_date = document.getElementById('schedule-start').value;
                    schedule.end_date = document.getElementById('schedule-end').value;
                }
                const p = document.getElementById('schedule-price').value;
                const s = document.getElementById('schedule-seats').value;
                if (p) schedule.current_price = parseInt(p, 10);
                if (s) schedule.available_seats = parseInt(s, 10);
                schedule.overwrite = document.getElementById('schedule-overwrite').value === 'true';

                // 간단 검증
                const required = ['flight_id','departure_airport','arrival_airport','departure_time','arrival_time','aircraft','base_price'];
                for (const k of required) {
                    if (!flight[k]) {
                        alert(`${k}는 필수입니다.`);
                        return;
                    }
                }
                if (mode === 'single' && !schedule.date) {
                    alert('스케줄 날짜를 입력하세요.');
                    return;
                }
                if (mode === 'range' && (!schedule.start_date || !schedule.end_date)) {
                    alert('스케줄 시작일/종료일을 입력하세요.');
                    return;
                }

                const payload = { flight, schedule };

                const resp = await fetch('https://api.cloudjet.click/api/admin/flights-with-schedules', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + (localStorage.getItem('token') || (Storage.getUser() && Storage.getUser().token) || '')
                    },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json();
                if (!resp.ok) {
                    throw new Error(data.message || '생성 실패');
                }
                alert(`항공편 생성 완료\nflight_id=${data.result.flight_id}\n스케줄 생성: ${data.result.created_schedules}건 (스킵 ${data.result.skipped}건)`);
                addFlightForm.reset();
                loadFlights();
                loadAvailableSchedules();
            } catch (err) {
                console.error('항공편 생성 오류:', err);
                alert('항공편 생성 오류: ' + err.message);
            }
        });

        const modeSel = document.getElementById('schedule-mode');
        if (modeSel) {
            modeSel.addEventListener('change', function() {
                const isRange = this.value === 'range';
                document.getElementById('schedule-date-wrapper').style.display = isRange ? 'none' : 'block';
                document.getElementById('schedule-start-wrapper').style.display = isRange ? 'block' : 'none';
                document.getElementById('schedule-end-wrapper').style.display = isRange ? 'block' : 'none';
            });
        }
    }
    
    // 할인 추가 폼 이벤트 리스너
    const discountForm = document.getElementById('discount-form');
    if (discountForm) {
        discountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const discountData = {
                schedule_id: document.getElementById('discount-schedule').value,
                discount_percentage: parseInt(document.getElementById('discount-rate').value)
            };
            
            if (!discountData.schedule_id) {
                alert('항공편 스케줄을 선택해주세요.');
                return;
            }
            
            fetch('https://api.cloudjet.click/api/admin/discounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(discountData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success || data.discount_id) {
                    alert('할인이 추가되었습니다.');
                    loadDiscounts();
                    loadAvailableSchedules();
                    discountForm.reset();
                    document.getElementById('flight-price-display').style.display = 'none';
                } else {
                    alert('오류: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error adding discount:', error);
                alert('할인 추가에 실패했습니다.');
            });
        });
    }
});

// 항공편 목록 로드
function loadFlights() {
    fetch('https://api.cloudjet.click/api/admin/flights', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector('#flights-table tbody');
        tbody.innerHTML = '';
        
        if (data.flights && data.flights.length > 0) {
            data.flights.forEach(flight => {
                const row = `
                    <tr>
                        <td>${flight.flight_id}</td>
                        <td>${flight.airline}</td>
                        <td>${flight.departure_airport_name} → ${flight.arrival_airport_name}</td>
                        <td>${flight.departure_time} - ${flight.arrival_time}</td>
                        <td>${flight.aircraft}</td>
                        <td>₩${(flight.base_price || 0).toLocaleString()}</td>
                        <td>${flight.total_seats || 180}</td>
                        <td>
                            <button class="btn-danger" onclick="deleteFlight('${flight.flight_id}')">삭제</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">등록된 항공편이 없습니다.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Error loading flights:', error);
    });
}

// 할인 가능한 스케줄 로드
function loadAvailableSchedules() {
    fetch('https://api.cloudjet.click/api/admin/schedules', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('discount-schedule');
        if (select) {
            select.innerHTML = '<option value="">항공편 스케줄 선택</option>';
            
            if (data.schedules && data.schedules.length > 0) {
                data.schedules.forEach(schedule => {
                    const hasDiscount = schedule.discount_percentage ? ' (할인 설정됨)' : '';
                    const dateStr = schedule.flight_date ? new Date(schedule.flight_date).toLocaleDateString('ko-KR') : '';
                    const option = `
                        <option value="${schedule.schedule_id}" ${schedule.discount_percentage ? 'disabled' : ''}>
                            ${schedule.flight_id} - ${schedule.departure_name} → ${schedule.arrival_name} 
                            (${dateStr} ${schedule.departure_time}) 
                            원가: ₩${schedule.current_price ? schedule.current_price.toLocaleString() : '0'}${hasDiscount}
                        </option>
                    `;
                    select.innerHTML += option;
                });
            }
        }
    })
    .catch(error => {
        console.error('Error loading schedules:', error);
    });
}

// 스케줄 선택 시 가격 표시
function showFlightPrice() {
    const select = document.getElementById('discount-schedule');
    const priceDisplay = document.getElementById('flight-price-display');
    
    if (select && priceDisplay) {
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const priceMatch = selectedOption.textContent.match(/원가: ₩([\d,]+)/);
            if (priceMatch) {
                priceDisplay.innerHTML = `<strong>현재 가격: ₩${priceMatch[1]}</strong>`;
                priceDisplay.style.display = 'block';
            }
        } else {
            priceDisplay.style.display = 'none';
        }
    }
}

// 할인 목록 로드
function loadDiscounts() {
    fetch('https://api.cloudjet.click/api/admin/discounts', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector('#discounts-table tbody');
        tbody.innerHTML = '';
        
        if (data.discounts && data.discounts.length > 0) {
            data.discounts.forEach(discount => {
                const flightDate = discount.flight_date ? new Date(discount.flight_date).toLocaleDateString('ko-KR') : '-';
                const flightTime = discount.departure_time ? `${flightDate} ${discount.departure_time}` : flightDate;
                const createdAt = discount.created_at ? new Date(discount.created_at).toLocaleString('ko-KR') : '-';
                
                const originalPrice = discount.current_price || 0;
                const discountedPrice = discount.discounted_price || 0;
                
                const row = `
                    <tr>
                        <td>${discount.flight_id}</td>
                        <td>${discount.departure_name} → ${discount.arrival_name}</td>
                        <td>${flightTime}</td>
                        <td>₩${originalPrice.toLocaleString()}</td>
                        <td>${discount.discount_percentage || 0}%</td>
                        <td>₩${discountedPrice.toLocaleString()}</td>
                        <td>${discount.status || 'ACTIVE'}</td>
                        <td>${createdAt}</td>
                        <td>
                            <button class="btn-danger" onclick="removeDiscount(${discount.discount_id})">삭제</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">설정된 할인이 없습니다.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Error loading discounts:', error);
    });
}

// 할인 삭제
function removeDiscount(discountId) {
    if (!confirm('정말로 이 할인을 삭제하시겠습니까?')) return;
    
    fetch(`https://api.cloudjet.click/api/admin/discounts/${discountId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('할인이 삭제되었습니다.');
            loadDiscounts();
            loadAvailableSchedules();
        } else {
            alert('오류: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting discount:', error);
        alert('할인 삭제에 실패했습니다.');
    });
}

// 예약 검색 함수 추가
function searchBookings() {
    const searchTerm = document.getElementById('booking-search').value.trim();
    
    if (searchTerm) {
        console.log('예약 검색:', searchTerm);
        // 검색 기능은 나중에 구현하고, 일단 전체 목록 로드
        loadBookings();
    } else {
        loadBookings();
    }
}

// 예약 목록 로드 (상세 정보 포함)
function loadBookings() {
    fetch('https://api.cloudjet.click/api/admin/bookings', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.bookings) {
            displayBookings(data.bookings);
        } else {
            console.error('예약 데이터 로드 오류:', data.message);
        }
    })
    .catch(error => {
        console.error('예약 데이터 로드 오류:', error);
    });
}

// 예약 목록 표시 (관리자용 테이블 형태)
function displayBookings(bookings) {
    const tbody = document.querySelector('#bookings-table tbody');
    if (!tbody) {
        console.error('bookings-table tbody를 찾을 수 없습니다.');
        return;
    }
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">예약이 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = bookings.map(booking => {
        const passengerNames = booking.passengers ? 
            booking.passengers.map(p => p.name_kor).join(', ') : 
            booking.customer_name;
            
        const flightInfo = `${booking.flight_id} (${booking.departure_name} → ${booking.arrival_name})`;
        const flightDate = booking.flight_date || '-';
        const seatNumber = booking.seat_number || '미지정'; // 좌석등급 대신 좌석번호
        const formattedAmount = formatPrice(booking.total_amount);
        
        return `
            <tr>
                <td>${booking.booking_number}</td>
                <td>${passengerNames}</td>
                <td>${flightInfo}</td>
                <td>${seatNumber}</td>
                <td>${flightDate}</td>
                <td>${getStatusText(booking.status)}</td>
                <td>${formattedAmount}</td>
                <td>
                    ${booking.status === 'CONFIRMED' ? 
                        `<button class="btn-danger" onclick="cancelBookingAdmin('${booking.booking_number}')">취소</button>` : 
                        '-'
                    }
                </td>
            </tr>
        `;
    }).join('');
}

// 예약 상태 텍스트 반환
function getStatusText(status) {
    const statusMap = {
        'CONFIRMED': '확정',
        'CANCELLED': '취소',
        'COMPLETED': '완료'
    };
    return statusMap[status] || status;
}

// 관리자용 예약 취소
function cancelBookingAdmin(bookingNumber) {
    if (!confirm(`예약번호 ${bookingNumber}을 정말로 취소하시겠습니까?`)) return;
    
    fetch(`https://api.cloudjet.click/api/admin/bookings/${bookingNumber}/cancel`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('예약이 취소되었습니다.');
            loadBookings();
        } else {
            alert('오류: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error cancelling booking:', error);
        alert('예약 취소에 실패했습니다.');
    });
}

// 가격 포맷팅
function formatPrice(amount) {
    return '₩' + (amount || 0).toLocaleString();
}

// 로그아웃
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = 'index.html';
    }
}
