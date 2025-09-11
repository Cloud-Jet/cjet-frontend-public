// booking.js - 예약 프로세스 관련 (수정됨)

// 예약 단계 표시
function showBookingStep(step) {
    console.log('showBookingStep 호출:', step);
    
    // 모든 단계 비활성화
    for (let i = 1; i <= 4; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (stepElement) {
            stepElement.classList.remove('active', 'completed');
        }
    }
    
    // 현재 단계까지 활성화
    for (let i = 1; i <= step; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (stepElement) {
            if (i < step) {
                stepElement.classList.add('completed');
            } else {
                stepElement.classList.add('active');
            }
        }
    }
    
    const content = document.getElementById('bookingContent');
    if (!content) {
        console.error('bookingContent 요소를 찾을 수 없습니다.');
        return;
    }
    
    switch(step) {
        case 1:
            showFlightConfirmation(content);
            break;
        case 2:
            showPassengerForm(content);
            break;
        case 3:
            showSeatSelection(content);
            break;
        case 4:
            showPayment(content);
            break;
    }
}

// 1단계: 항공편 확인
function showFlightConfirmation(content) {
    if (!selectedFlight) {
        console.error('selectedFlight가 없습니다.');
        return;
    }
    
    content.innerHTML = `
        <h3>선택한 항공편 확인</h3>
        <div class="flight-item" style="margin: 2rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div class="flight-info">
                <div class="flight-route">
                    <div>
                        <div class="flight-time">${selectedFlight.departureTime}</div>
                        <div class="flight-airport">${getAirportName ? getAirportName(selectedFlight.departureAirport) : selectedFlight.departureAirport}</div>
                    </div>
                    <div class="flight-arrow">→</div>
                    <div>
                        <div class="flight-time">${selectedFlight.arrivalTime}</div>
                        <div class="flight-airport">${getAirportName ? getAirportName(selectedFlight.arrivalAirport) : selectedFlight.arrivalAirport}</div>
                    </div>
                </div>
                <div class="flight-details">
                    <span>${selectedFlight.airline}</span>
                    <span>${selectedFlight.flightId}</span>
                    <span>${selectedFlight.duration}</span>
                    <span>${selectedFlight.date}</span>
                </div>
            </div>
            <div class="flight-price">
                <div class="price-amount">${formatPrice ? formatPrice(selectedFlight.price) : selectedFlight.price + '원'}</div>
                <div style="font-size: 14px; color: #666;">1인 요금</div>
            </div>
        </div>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 5px; margin-bottom: 2rem;">
            <p style="margin: 0; color: #666;">
                <strong>참고사항:</strong> 표시된 요금은 유류할증료 및 세금이 포함된 총액입니다.
            </p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
            <button class="btn btn-outline" onclick="showSearchResults()">이전</button>
            <button class="btn btn-primary" onclick="showBookingStep(2)">다음 단계</button>
        </div>
    `;
}

// 2단계: 승객 정보 입력
function showPassengerForm(content) {
    const passengersSelect = document.getElementById('passengers');
    const passengerCount = passengersSelect ? parseInt(passengersSelect.value) : 1;
    
    content.innerHTML = `
        <h3>승객 정보 입력</h3>
        <div class="passenger-forms">
            ${Array.from({length: passengerCount}, (_, i) => `
                <div class="passenger-form">
                    <h4>승객 ${i + 1}</h4>
                    <div class="passenger-inputs">
                        <div class="form-group">
                            <label>성명 (한글)</label>
                            <input type="text" id="passenger-name-${i}" placeholder="홍길동" required>
                        </div>
                        <div class="form-group">
                            <label>성명 (영문)</label>
                            <input type="text" id="passenger-name-en-${i}" placeholder="HONG GILDONG" required>
                        </div>
                        <div class="form-group">
                            <label>생년월일</label>
                            <input type="date" id="passenger-birth-${i}" required>
                        </div>
                        <div class="form-group">
                            <label>성별</label>
                            <select id="passenger-gender-${i}">
                                <option value="M">남성</option>
                                <option value="F">여성</option>
                            </select>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="passenger-form">
            <h4>연락처 정보</h4>
            <div class="passenger-inputs">
                <div class="form-group">
                    <label>이메일</label>
                    <input type="email" id="contact-email" value="${currentUser ? currentUser.email : ''}" required>
                </div>
                <div class="form-group">
                    <label>휴대폰</label>
                    <input type="tel" id="contact-phone" value="${currentUser && currentUser.phone ? currentUser.phone : ''}" placeholder="010-1234-5678" required>
                </div>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
            <button class="btn btn-outline" onclick="showBookingStep(1)">이전</button>
            <button class="btn btn-primary" onclick="savePassengerInfo()">다음 단계</button>
        </div>
    `;
}

// 3단계: 좌석 선택
async function showSeatSelection(content) {
    content.innerHTML = `
        <h3>좌석 선택</h3>
        <p style="text-align: center; margin: 1rem 0;">
            원하시는 좌석을 선택해주세요 (${bookingData.passengers.length}석)
        </p>
        <div id="seatLoadingMessage" style="text-align: center; margin: 2rem 0;">
            <p>좌석 정보를 불러오는 중...</p>
        </div>
        <div style="text-align: center; margin-bottom: 2rem; display: none;" id="seatDirections">
            <div style="display: inline-block; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
                <div style="font-size: 14px; color: #666;">앞쪽</div>
                <div style="font-size: 20px; margin: 0.5rem 0;">↑</div>
                <div style="font-size: 14px; color: #666;">기내 진행 방향</div>
            </div>
        </div>
        <div class="seat-map" id="seatMap" style="display: none;">
        </div>
        <div style="margin-top: 1rem; text-align: center; color: #666; display: none;" id="selectedSeatsInfo">
            선택한 좌석: <span id="selectedSeatsDisplay" style="font-weight: bold;">없음</span>
        </div>
        <div class="seat-legend" style="display: none;" id="seatLegend">
            <div class="legend-item">
                <div class="legend-seat available"></div>
                <span>선택 가능</span>
            </div>
            <div class="legend-item">
                <div class="legend-seat selected"></div>
                <span>선택됨</span>
            </div>
            <div class="legend-item">
                <div class="legend-seat occupied"></div>
                <span>선택 불가</span>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
            <button class="btn btn-outline" onclick="showBookingStep(2)">이전</button>
            <button class="btn btn-primary" onclick="proceedToPayment()">다음 단계</button>
        </div>
    `;
    bookingData.seats = []; // 좌석 선택 초기화
    
    // 예약된 좌석 정보 로드
    await loadOccupiedSeats();
}

// 예약된 좌석 정보 로드
async function loadOccupiedSeats() {
    try {
        const response = await window.api.getOccupiedSeats(selectedFlight.scheduleId);
        if (response.occupied_seats) {
            generateSeatMap(response.occupied_seats);
        } else {
            generateSeatMap([]);
        }
    } catch (error) {
        console.error('좌석 정보 로드 오류:', error);
        generateSeatMap([]);
    }
}

// 좌석 맵 생성 (실제 예약된 좌석만 빨간색 표시)
function generateSeatMap(occupiedSeats = []) {
    const rows = 25;
    const seatsPerRow = 6;
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    const occupiedSet = new Set(occupiedSeats);
    
    let seatHTML = '';
    
    for (let row = 1; row <= rows; row++) {
        seatHTML += '<div class="seat-row">';
        
        for (let col = 0; col < seatsPerRow; col++) {
            const seatId = `${row}${seatLetters[col]}`;
            const isOccupied = occupiedSet.has(seatId);
            
            // ABC 다음에 통로 삽입
            if (col === 3) {
                seatHTML += '<div class="seat aisle"></div>';
            }
            
            seatHTML += `
                <div class="seat ${isOccupied ? 'occupied' : 'available'}" 
                     id="seat-${seatId}"
                     data-seat="${seatId}"
                     ${isOccupied ? 'style="pointer-events: none; cursor: not-allowed; background-color: #ff6b6b; color: white;"' : `onclick="selectSeat('${seatId}')" style="cursor: pointer;"`}>
                    ${seatId}
                </div>
            `;
        }
        
        seatHTML += '</div>';
    }
    
    const seatMapElement = document.getElementById('seatMap');
    if (seatMapElement) {
        seatMapElement.innerHTML = seatHTML;
        seatMapElement.style.display = 'block';
        document.getElementById('seatLoadingMessage').style.display = 'none';
        document.getElementById('seatDirections').style.display = 'block';
        document.getElementById('selectedSeatsInfo').style.display = 'block';
        document.getElementById('seatLegend').style.display = 'flex';
    }
}

// 좌석 선택 함수
function selectSeat(seatId) {
    const seatElement = document.getElementById(`seat-${seatId}`);
    if (!seatElement) return;
    
    // 이미 예약된 좌석인지 확인
    if (seatElement.classList.contains('occupied')) {
        alert('이미 예약된 좌석입니다.');
        return;
    }
    
    // 단일 좌석 선택만 허용
    if (seatElement.classList.contains('selected')) {
        // 선택 해제
        seatElement.classList.remove('selected');
        seatElement.style.backgroundColor = '';
        seatElement.style.color = '';
        bookingData.seats = [];
    } else {
        // 이전 선택 해제
        const previousSelected = document.querySelector('.seat.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
            previousSelected.style.backgroundColor = '';
            previousSelected.style.color = '';
        }
        
        // 새 좌석 선택
        seatElement.classList.add('selected');
        seatElement.style.backgroundColor = '#057beb';
        seatElement.style.color = 'white';
        bookingData.seats = [seatId];
    }
    
    // 선택된 좌석 표시 업데이트
    const selectedSeatsDisplay = document.getElementById('selectedSeatsDisplay');
    if (selectedSeatsDisplay) {
        selectedSeatsDisplay.textContent = bookingData.seats.length > 0 ? bookingData.seats.join(', ') : '없음';
    }
}

// 4단계: 결제
function showPayment(content) {
    if (!selectedFlight) return;
    
    const totalPrice = selectedFlight.price * bookingData.passengers.length;
    content.innerHTML = `
        <h3>결제 정보</h3>
        <div class="passenger-form">
            <h4>예약 요약</h4>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">항공편</div>
                    <div class="info-value">${selectedFlight.flightId} - ${getAirportName ? getAirportName(selectedFlight.departureAirport) : selectedFlight.departureAirport} → ${getAirportName ? getAirportName(selectedFlight.arrivalAirport) : selectedFlight.arrivalAirport}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">출발 시간</div>
                    <div class="info-value">${selectedFlight.date} ${selectedFlight.departureTime}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">승객</div>
                    <div class="info-value">${bookingData.passengers.map(p => p.name).join(', ')}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">좌석</div>
                    <div class="info-value">${bookingData.seats.length > 0 ? bookingData.seats.join(', ') : '선택 안함'}</div>
                </div>
            </div>
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #eee;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <span>항공요금 (${bookingData.passengers.length}명)</span>
                    <span>${formatPrice ? formatPrice(totalPrice) : totalPrice + '원'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold;">
                    <span>총 결제 금액</span>
                    <span style="color: #057beb;">${formatPrice ? formatPrice(totalPrice) : totalPrice + '원'}</span>
                </div>
            </div>
        </div>
            <div class="passenger-form" style="text-align: center;">
            <h4>결제</h4>
            <button class="btn btn-primary" style="padding: 1rem 2rem; font-size: 16px;" onclick="startPaymentUnified()">결제하기</button>
        </div>
        <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0 0 0.5rem 0; font-weight: bold;">결제 전 확인사항</p>
            <ul style="margin: 0; padding-left: 1.5rem; font-size: 14px; color: #666;">
                <li>항공권은 환불 및 변경 규정에 따라 수수료가 발생할 수 있습니다.</li>
                <li>탑승객 성명은 여권과 동일해야 합니다.</li>
                <li>출발 48시간 전까지 온라인 체크인이 가능합니다.</li>
            </ul>
        </div>
            <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
            <button class="btn btn-outline" onclick="showBookingStep(3)">이전</button>
            <button class="btn btn-primary" id="payButton" onclick="startPayment()" disabled>결제하기</button>
        </div>
    `;
}

// 승객 정보 저장
function savePassengerInfo() {
    const passengersSelect = document.getElementById('passengers');
    const passengerCount = passengersSelect ? parseInt(passengersSelect.value) : 1;
    
    bookingData.passengers = [];
    
    for (let i = 0; i < passengerCount; i++) {
        const name = document.getElementById(`passenger-name-${i}`).value.trim();
        const nameEn = document.getElementById(`passenger-name-en-${i}`).value.trim();
        const birth = document.getElementById(`passenger-birth-${i}`).value;
        const gender = document.getElementById(`passenger-gender-${i}`).value;
        
        if (!name || !nameEn || !birth) {
            alert(`승객 ${i + 1}의 정보를 모두 입력해주세요.`);
            return;
        }
        
        bookingData.passengers.push({
            name,
            nameEn,
            birth,
            gender
        });
    }
    
    // 연락처 정보 저장
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    
    if (!email || !phone) {
        alert('연락처 정보를 모두 입력해주세요.');
        return;
    }
    
    bookingData.contact = { email, phone };
    
    showBookingStep(3);
}

// 결제 진행
function proceedToPayment() {
    if (bookingData.seats.length === 0) {
        alert('좌석을 선택해주세요.');
        return;
    }
    
    showBookingStep(4);
}

// 결제 수단 선택
function selectPaymentMethod(method) { bookingData.paymentMethod = method; }

// 결제 시작 (Bootpay)
async function startPayment() {
    if (!window.Bootpay) {
        alert('결제 스크립트를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.');
        return;
    }

    // 부트페이 결제창 스타일 적용
    const style = document.createElement('style');
    style.innerHTML = `
        /* 배너 및 다른 요소들이 결제창에 영향을 주지 않도록 처리 */
        #bootpay-payment-window-id {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 520px !important;  /* 결제 창 가로 크기를 더 넓게 설정 */
            height: 750px !important; /* 결제 창 세로 크기 */
            position: fixed !important;  /* 화면에 고정 */
            top: 50% !important;  /* 화면 중앙에 배치 */
            left: 50% !important;  /* 화면 중앙에 배치 */
            transform: translate(-50%, -50%) !important; /* 정확하게 화면 중앙에 맞춤 */
            z-index: 9999 !important;  /* 배너 위에 표시되도록 */
            border: none !important;  /* 테두리 제거 */
        }

        /* iframe 크기 조정 */
        #bootpay-payment-window-id iframe {
            display: block !important;
            margin: 0 !important;
            width: 100% !important;   /* iframe 가로 크기를 결제 창 크기에 맞춤 */
            height: 100% !important;  /* iframe 세로 크기를 결제 창 크기에 맞춤 */
            background: #fff !important;
            border-radius: 12px !important;
        }
    `;
    document.head.appendChild(style);

    try {
        const totalAmount = selectedFlight.price * bookingData.passengers.length;

        // 1) 결제 초기화 (서버에 사전 주문 생성)
        const init = await PaymentAPI.initPayment({
            scheduleId: selectedFlight.scheduleId,
            amount: totalAmount,
            orderName: `${selectedFlight.flightId} 항공권 (${bookingData.passengers.length}명)`
        });

        if (!init.success) {
            alert(init.message || '결제 초기화 실패');
            return;
        }

        const applicationId = init.bootpay.application_id;
        const orderId = init.order_id;

        // 2) Bootpay 결제 요청
        const method = 'card';
        const provider = 'nicepay';
        await Bootpay.requestPayment({
            application_id: applicationId,
            price: totalAmount,
            order_name: `${selectedFlight.flightId} 항공권`,
            order_id: orderId,
            pg: provider,
            method: method,
            user: {
                id: (currentUser && currentUser.id) || undefined,
                username: (currentUser && currentUser.name) || undefined,
                phone: bookingData.contact.phone
            },
            items: [
                { id: selectedFlight.flightId, name: `${selectedFlight.departureAirport}-${selectedFlight.arrivalAirport}`, qty: bookingData.passengers.length, price: selectedFlight.price }
            ]
        });

        // 결제 완료 후 서버 웹훅에서 상태 반영됨. 여기서는 예약 API 호출
        await finalizeBooking(totalAmount, init.order_id);

    } catch (e) {
        console.error('결제 중 오류:', e);
        alert('결제에 실패했습니다. 다시 시도해주세요.');
    }
}

// 단일 결제 버튼용 래퍼: 우선 카카오 → 실패 시 카드 시도
async function startPaymentUnified() {
    bookingData.paymentMethod = 'card';
    await startPayment();
}

// 결제 완료 후 예약 확정 처리
async function finalizeBooking(totalAmount, orderId) {
    const bookingRequest = {
        scheduleId: selectedFlight.scheduleId,
        passengers: bookingData.passengers,
        contactInfo: bookingData.contact,
        paymentMethod: bookingData.paymentMethod,
        totalAmount: totalAmount,
        seats: bookingData.seats
    };

    const response = await window.api.createBooking(bookingRequest);
    if (response.success) {
        try { await PaymentAPI.attachBooking(orderId, response.booking_id || response.bookingNumber); } catch (e) { console.warn('attachBooking 실패(무시 가능):', e); }
        showBookingSuccess(response.booking_number);
    } else {
        alert(response.message || '예약 처리 중 오류가 발생했습니다.');
    }
}

function showBookingSuccess(bookingNumber) {
    const modalElement = document.createElement('div');
    modalElement.id = 'successModal';
    modalElement.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content success-modal">
                <div class="modal-header">
                    <div class="success-icon">✓</div>
                    <h2>예약 완료!</h2>
                </div>
                <div class="modal-body">
                    <p class="success-message">항공편 예약이 성공적으로 완료되었습니다.</p>
                    <div class="booking-info">
                        <div class="info-row">
                            <span class="label">예약번호</span>
                            <span class="value booking-number">${bookingNumber}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">항공편</span>
                            <span class="value">${selectedFlight.flightId}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">출발</span>
                            <span class="value">${selectedFlight.date} ${selectedFlight.departureTime}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">좌석</span>
                            <span class="value">${bookingData.seats.join(', ') || '미지정'}</span>
                        </div>
                    </div>
                    <p class="note">예약 확인서는 이메일로 발송됩니다.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeSuccessModal(); showPage('bookings');">예약 목록</button>
                    <button class="btn btn-primary" onclick="closeSuccessModal(); showPage('home');">홈으로</button>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease; }
        .success-modal { background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); animation: slideUp 0.3s ease; }
        .modal-header { text-align: center; margin-bottom: 1.5rem; }
        .success-icon { width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold; margin: 0 auto 1rem; animation: bounce 0.6s ease; }
        .modal-header h2 { color: #1f2937; margin: 0; font-size: 1.5rem; }
        .modal-body { margin-bottom: 1.5rem; }
        .success-message { text-align: center; color: #6b7280; margin-bottom: 1.5rem; }
        .booking-info { background: #f8fafc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding: 0.25rem 0; }
        .info-row .label { color: #6b7280; font-weight: 500; }
        .info-row .value { color: #1f2937; font-weight: 600; }
        .booking-number { color: #059669 !important; font-family: monospace; font-size: 1.1rem; }
        .note { text-align: center; color: #9ca3af; font-size: 0.875rem; margin: 0; }
        .modal-footer { display: flex; gap: 0.75rem; justify-content: center; }
        .modal-footer .btn { flex: 1; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; border: none; cursor: pointer; transition: all 0.2s ease; }
        .btn-outline { background: transparent; color: #6b7280; border: 1px solid #d1d5db; }
        .btn-outline:hover { background: #f9fafb; border-color: #9ca3af; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0, -8px, 0); } 70% { transform: translate3d(0, -4px, 0); } 90% { transform: translate3d(0, -2px, 0); } }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modalElement);
}

// 성공 모달 닫기 함수
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.remove();
    }
}

// 전역 접근을 위해 window 객체에 추가
window.closeSuccessModal = closeSuccessModal;
