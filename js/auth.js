// auth.js - 로그인/회원가입 관련 (API 연동 버전)

// 회원가입 - API 사용
async function signup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const phone = document.getElementById('signupPhone').value.trim();
    const birthDate = document.getElementById('signupBirthDate').value;
    
    // 유효성 검사
    if (!name || name.length < 2) {
        alert('이름을 2자 이상 입력해주세요.');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        return;
    }
    
    if (password.length < 6) {
        alert('비밀번호는 6자 이상이어야 합니다.');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (!phone || phone.length < 10) {
        alert('올바른 전화번호를 입력해주세요.');
        return;
    }
    
    if (!validateBirthDate(birthDate)) {
        alert('올바른 생년월일을 입력해주세요.');
        return;
    }
    
    try {
        const userData = {
            name,
            email,
            password,
            phone: formatPhone(phone),
            birthDate
        };
        
        const result = await AuthAPI.signup(userData);
        
        if (result.success) {
            alert('회원가입이 완료되었습니다. 로그인해주세요.');
            closeModal('signupModal');
            showLoginModal();
            
            // 로그인 폼에 이메일 자동 입력
            document.getElementById('loginEmail').value = email;
        }
    } catch (error) {
        alert('회원가입 오류: ' + error.message);
        console.error('Signup error:', error);
    }
}

// 로그인 - API 사용
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        return;
    }
    
    if (!password) {
        alert('비밀번호를 입력해주세요.');
        return;
    }
    
    try {
        const credentials = { email, password };
        const result = await AuthAPI.login(credentials);
        
        if (result.token) {
            // 토큰을 포함한 사용자 정보 저장
            const userData = {
                ...result.user,
                token: result.token
            };
            
            Storage.setUser(userData);
            currentUser = userData;
            
            // 관리자인 경우 admin 페이지로 리다이렉트
            if (result.user.role === 'ADMIN') {
                localStorage.setItem('token', result.token);
                localStorage.setItem('userInfo', JSON.stringify(result.user));
                window.location.href = 'admin.html';
                return;
            }
            
            closeModal('loginModal');
            updateAuthUI();
            showAlert('로그인 성공', `${userData.name}님, 환영합니다!`, 'success');
            
            // 로그인 후 이전 페이지로 복귀하거나 홈으로 이동
            executePendingAction();
            
            if (window.location.hash === '#booking') {
                // 예약 프로세스 중이었다면 계속 진행
            } else if (!window.pendingAction) {
                // 대기 중인 액션이 없을 때만 홈으로 이동
                showHome();
            }
        }
    } catch (error) {
        alert('로그인 오류: ' + error.message);
        console.error('Login error:', error);
    }
}

// 로그아웃
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        currentUser = null;
        Storage.removeUser();
        updateAuthUI();
        showHome();
        showAlert('로그아웃', '안전하게 로그아웃되었습니다.', 'info');
    }
}

// 로그인 상태 확인
function isLoggedIn() {
    return currentUser !== null && currentUser.token;
}

// 로그인 필요 체크 
function requireLogin(callback) {
    if (!isLoggedIn()) {
        alert('로그인이 필요한 서비스입니다.');
        showLoginModal();
        return false;
    }
    
    // 로그인된 상태라면 콜백 실행
    if (callback && typeof callback === 'function') {
        callback();
    }
    return true;
}

// 로그인 후 특정 페이지로 이동하는 함수
function loginAndRedirect(targetFunction) {
    if (isLoggedIn()) {
        // 이미 로그인된 상태라면 바로 실행
        if (typeof targetFunction === 'function') {
            targetFunction();
        }
        return true;
    } else {
        // 로그인이 필요한 경우
        alert('로그인이 필요한 서비스입니다.');
        showLoginModal();
        
        // 로그인 성공 후 실행할 함수를 저장
        window.pendingAction = targetFunction;
        return false;
    }
}

// 로그인 성공 후 대기 중인 액션 실행
function executePendingAction() {
    if (window.pendingAction && typeof window.pendingAction === 'function') {
        window.pendingAction();
        window.pendingAction = null;
    }
}

// 사용자 프로필 로드 (API에서)
async function loadUserProfile() {
    if (!isLoggedIn()) return;
    
    try {
        const result = await AuthAPI.getProfile();
        if (result.user) {
            // 토큰은 유지하면서 프로필 정보 업데이트
            const updatedUser = {
                ...result.user,
                token: currentUser.token
            };
            
            Storage.setUser(updatedUser);
            currentUser = updatedUser;
            updateAuthUI();
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
        // 토큰이 만료된 경우 로그아웃 처리
        if (error.message.includes('토큰') || error.message.includes('인증')) {
            logout();
        }
    }
}

// 프로필 업데이트 (추후 API 연동 예정)
function updateProfile(userData) {
    // 현재는 로컬 스토리지만 업데이트
    // 추후 API 연동 시 서버에도 업데이트
    if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        Storage.setUser(updatedUser);
        currentUser = updatedUser;
        updateAuthUI();
    }
}

// 비밀번호 변경 (추후 API 연동 예정)
function changePassword(oldPassword, newPassword) {
    // 추후 API 연동 구현
    return { success: false, message: '현재는 지원되지 않는 기능입니다.' };
}
