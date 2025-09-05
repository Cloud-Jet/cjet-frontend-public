// CloudJet 항공 예약 시스템 - 환경별 설정 관리
// 개발/스테이징/프로덕션 환경에 따라 API 서버 주소와 설정을 자동으로 변경

// 호스트명으로 환경 감지
function detectEnvironment() {
    const hostname = window.location.hostname;
    
    // 로컬 개발 환경
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    } 
    // 프로덕션 환경 (CloudFront 또는 도메인)
    else if (hostname.includes('.cloudfront.net') || hostname.includes('cloudjet')) {
        return 'production';
    } 
    // 스테이징 환경 (기타)
    else {
        return 'staging';
    }
}

// 환경별 API 서버 설정
const config = {
    development: {
        API_BASE_URL: 'http://localhost:5000/api',
        API_GATEWAY_URL: 'http://localhost:5000',
        DEBUG: true,
        CACHE_ENABLED: false
    },
    staging: {
        API_BASE_URL: 'https://api-staging.cloudjet.com/api',
        API_GATEWAY_URL: 'https://api-staging.cloudjet.com',
        DEBUG: true,
        CACHE_ENABLED: true
    },
    production: {
        API_BASE_URL: 'https://api.cloudjet.click/api',
        API_GATEWAY_URL: 'https://api.cloudjet.click',
        DEBUG: false,
        CACHE_ENABLED: true
    }
};

const currentEnv = detectEnvironment();
const currentConfig = config[currentEnv];

// 전역에서 사용할 설정 객체
window.CONFIG = {
    ENV: currentEnv,
    ...currentConfig,
    
    // CloudFront CDN 설정
    CLOUDFRONT: {
        DOMAIN: currentEnv === 'production' ? 'https://d7aq35kj9vr3c.cloudfront.net' : null,
        CACHE_POLICY: {
            STATIC_FILES: 31536000, // 1년
            CSS_JS: 86400,          // 1일
            HTML: 300               // 5분
        }
    },
    
    LOG_LEVEL: currentEnv === 'production' ? 'error' : 'debug'
};

window.API_BASE_URL = currentConfig.API_BASE_URL;
console.log(`[CONFIG] Environment: ${currentEnv}`);
console.log(`[CONFIG] API Base URL: ${currentConfig.API_BASE_URL}`);
console.log(`[CONFIG] Debug Mode: ${currentConfig.DEBUG}`);

