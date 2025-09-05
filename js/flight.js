// 검색 상태 저장을 위한 전역 변수
let currentSearchData = null;

// 검색 상태 저장
function saveSearchState(searchParams, results) {
    currentSearchData = {
        searchParams,
        results,
        timestamp: Date.now()
    };
    // 세션 스토리지에 저장 (브라우저 닫을 때까지 유지)
    sessionStorage.setItem('cloudjet_search_data', JSON.stringify(currentSearchData));
}

// 검색 상태 복원
function restoreSearchState() {
    try {
        const saved = sessionStorage.getItem('cloudjet_search_data');
        if (saved) {
            const data = JSON.parse(saved);
            // 30분 이내 데이터만 사용
            if (Date.now() - data.timestamp < 30 * 60 * 1000) {
                currentSearchData = data;
                return data;
            }
        }
    } catch (error) {
        console.error('검색 상태 복원 오류:', error);
    }
    return null;
}

// 검색 결과 복원
function restoreSearchResults(searchData) {
    console.log('검색 결과 복원:', searchData);
    
    // 페이지 표시
    hideAllPages();
    document.getElementById('searchResultsPage').style.display = 'block';
    document.getElementById('searchLoading').style.display = 'none';
    document.getElementById('flightList').style.display = 'block';
    
    // 검색 폼 데이터 복원
    const { searchParams } = searchData;
    if (searchParams) {
        const departureEl = document.getElementById('departure');
        const arrivalEl = document.getElementById('arrival');
        const departureDateEl = document.getElementById('departureDate');
        const passengersEl = document.getElementById('passengers');
        const tripTypeEl = document.querySelector(`input[name="tripType"][value="${searchParams.tripType}"]`);
        
        if (departureEl) departureEl.value = searchParams.departure;
        if (arrivalEl) arrivalEl.value = searchParams.arrival;
        if (departureDateEl) departureDateEl.value = searchParams.departureDate;
        if (passengersEl) passengersEl.value = searchParams.passengers;
        if (tripTypeEl) tripTypeEl.checked = true;
    }
    
    // 검색 결과 표시
    displaySearchResults(
        searchData.results,
        searchParams.departure,
        searchParams.arrival,
        searchParams.departureDate,
        searchParams.passengers
    );
}

// 검색 상태 삭제
function clearSearchState() {
    currentSearchData = null;
    sessionStorage.removeItem('cloudjet_search_data');
}

// flight.js - 항공편 검색 관련

// 항공편 검색 - API 사용
async function searchFlights() {
    const departure = document.getElementById('departure').value;
    const arrival = document.getElementById('arrival').value;
    const departureDate = document.getElementById('departureDate').value;
    const passengers = document.getElementById('passengers').value;
    const tripType = document.querySelector('input[name="tripType"]:checked').value;

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
    
    // URL hash 설정으로 새로고침 시에도 검색 결과 페이지 유지
    if (window.location.hash !== '#search') {
        history.pushState(null, '', '#search');
    }

    try {
        const searchParams = {
            departure,
            arrival,
            date: departureDate
        };
        
        console.log('항공편 검색 시작:', searchParams);
        const result = await FlightAPI.search(searchParams);
        console.log('검색 결과:', result);
        
        // 검색 결과 저장
        saveSearchState({
            departure,
            arrival,
            departureDate,
            passengers,
            tripType
        }, result.flights || []);
        
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

// 검색 결과 표시
function displaySearchResults(flights, departure, arrival, date, passengers) {
    document.getElementById('searchLoading').style.display = 'none';
    document.getElementById('flightList').style.display = 'block';
    
    const flightList = document.getElementById('flightList');
    
    if (!flights || flights.length === 0) {
        flightList.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p>선택한 조건에 맞는 항공편을 찾을 수 없습니다.</p>
                <button class="btn btn-primary" onclick="showHome()">다시 검색</button>
            </div>
        `;
        return;
    }
    
    flightList.innerHTML = `
        <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <button class="btn btn-outline" onclick="showHome()">← 다시 검색</button>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0; color: #666;">
                    ${getAirportName(departure)} → ${getAirportName(arrival)}
                </p>
                <p style="margin: 0; color: #666;">
                    ${new Date(date).toLocaleDateString('ko-KR')} | 승객 ${passengers}명
                </p>
            </div>
        </div>
        <div style="margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0; color: #666;">
                총 <strong>${flights.length}개</strong>의 항공편을 찾았습니다.
            </p>
        </div>
        ${flights.map(flight => createFlightCard(flight)).join('')}
    `;
}

// 항공편 카드 생성
function createFlightCard(flight) {
    const hasDiscount = flight.has_discount && flight.discount_percentage > 0;
    const priceDisplay = hasDiscount ? 
        `<div class="discount-info">
            <span class="original-price">₩${flight.original_price.toLocaleString()}</span>
            <span class="discount-badge">${flight.discount_percentage}% 할인</span>
        </div>
        <div class="discounted-price">₩${flight.price.toLocaleString()}</div>` :
        `<div class="flight-price">₩${flight.price.toLocaleString()}</div>`;
    
    return `
        <div class="flight-item ${hasDiscount ? 'discounted-flight' : ''}">
            ${hasDiscount ? '<div class="special-offer-badge">특가</div>' : ''}
            <div class="flight-info">
                <div class="flight-route">
                    <div>
                        <div class="flight-time">${flight.departureTime}</div>
                        <div class="flight-airport">${getAirportName(flight.departureAirport)}</div>
                    </div>
                    <div class="flight-path">
                        <div class="flight-duration">${flight.duration}</div>
                        <div class="flight-line"></div>
                        <div class="flight-number">${flight.flightId}</div>
                    </div>
                    <div>
                        <div class="flight-time">${flight.arrivalTime}</div>
                        <div class="flight-airport">${getAirportName(flight.arrivalAirport)}</div>
                    </div>
                </div>
                <div class="flight-details">
                    <span class="airline">${flight.airline}</span>
                    <span class="aircraft">${flight.aircraft}</span>
                    <span class="seats">잔여 ${flight.available_seats}석</span>
                </div>
            </div>
            <div class="flight-price-section">
                ${priceDisplay}
                <button class="btn btn-primary" onclick="selectFlight('${flight.schedule_id}', ${flight.price})">
                    선택
                </button>
            </div>
        </div>
    `;
}

// 항공편 선택
function selectFlight(scheduleId, price) {
    if (!requireLogin()) return;
    
    // DOM에서 선택한 항공편의 모든 정보 추출
    const flightItems = document.querySelectorAll('.flight-item');
    let flightData = null;
    
    for (let item of flightItems) {
        const button = item.querySelector(`button[onclick*="${scheduleId}"]`);
        if (button) {
            const flightInfo = item.querySelector('.flight-info');
            const routeInfo = flightInfo.querySelector('.flight-route');
            const detailsInfo = flightInfo.querySelector('.flight-details');
            
            // 출발/도착 시간과 공항 정보 추출
            const times = routeInfo.querySelectorAll('.flight-time');
            const airports = routeInfo.querySelectorAll('.flight-airport');
            const flightNumber = routeInfo.querySelector('.flight-number');
            const duration = routeInfo.querySelector('.flight-duration');
            const airline = detailsInfo.querySelector('.airline');
            const aircraft = detailsInfo.querySelector('.aircraft');
            
            flightData = {
                scheduleId: scheduleId,  // schedule_id 대신 scheduleId 사용
                price: price,
                flightId: flightNumber ? flightNumber.textContent.trim() : '',
                departureTime: times[0] ? times[0].textContent.trim() : '',
                arrivalTime: times[1] ? times[1].textContent.trim() : '',
                departureAirport: extractAirportCode(airports[0] ? airports[0].textContent.trim() : ''),
                arrivalAirport: extractAirportCode(airports[1] ? airports[1].textContent.trim() : ''),
                duration: duration ? duration.textContent.trim() : '',
                airline: airline ? airline.textContent.trim() : '',
                aircraft: aircraft ? aircraft.textContent.trim() : '',
                date: document.getElementById('departureDate').value
            };
            break;
        }
    }
    
    if (!flightData) {
        alert('항공편 정보를 불러올 수 없습니다. 다시 시도해주세요.');
        return;
    }
    
    selectedFlight = flightData;
    bookingData.flight = selectedFlight;
    
    console.log('선택된 항공편:', selectedFlight);
    
    // 예약 프로세스 페이지로 이동
    hideAllPages();
    document.getElementById('bookingProcessPage').style.display = 'block';
    window.location.hash = 'booking';
    
    showBookingStep(1);
}

// 공항 이름에서 코드 추출 (예: "인천국제공항 (ICN)" -> "ICN")
function extractAirportCode(airportText) {
    const match = airportText.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : airportText;
}

// 비행 시간 계산
function calculateFlightDuration(departure, arrival) {
    const durations = {
        'ICN-NRT': '2h 45m',
        'ICN-KIX': '3h 15m', 
        'ICN-BKK': '6h 30m',
        'ICN-SYD': '9h 45m',
        'ICN-LAX': '12h 30m',
        'ICN-CDG': '13h 15m',
        'GMP-NRT': '2h 30m',
        'GMP-KIX': '3h 00m',
        'NRT-ICN': '2h 30m',
        'KIX-ICN': '3h 00m',
        'BKK-ICN': '6h 15m',
        'SYD-ICN': '9h 30m',
        'LAX-ICN': '13h 45m',
        'CDG-ICN': '12h 00m'
    };
    
    return durations[`${departure}-${arrival}`] || '3h 00m';
}
