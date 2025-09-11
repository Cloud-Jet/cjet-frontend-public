# ✈️ CloudJet Frontend - 항공편 예약 시스템

> **현대적인 항공편 예약 시스템의 프론트엔드**  
> HTML5 + Vanilla JS + AWS CloudFront를 활용한 글로벌 정적 웹사이트

[![CI/CD](https://github.com/Cloud-Jet/cjet-frontend-public/workflows/Deploy/badge.svg)](https://github.com/Cloud-Jet/cjet-frontend-public/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Cloud-Jet_cjet-frontend-public&metric=alert_status)](https://sonarcloud.io/project/overview?id=Cloud-Jet_cjet-frontend-public)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Cloud-Jet_cjet-frontend-public&metric=security_rating)](https://sonarcloud.io/project/overview?id=Cloud-Jet_cjet-frontend-public)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://www.cloudjet.click)

---

## 📋 **프로젝트 개요**

CloudJet Frontend는 현대적인 항공편 예약 시스템의 사용자 인터페이스를 제공하는 **정적 웹 애플리케이션**입니다.  
AWS 클라우드 인프라와 완전 자동화된 CI/CD 파이프라인을 통해 전 세계 사용자에게 빠르고 안전한 서비스를 제공합니다.

### 🎯 **핵심 특징**
- 🌐 **글로벌 CDN**: CloudFront를 통한 전 세계 배포
- 🔄 **완전 자동화**: GitHub Actions 기반 CI/CD
- 📊 **코드 품질**: SonarCloud 정적 분석 + Slack 알림 연동
- 🔒 **보안**: HTTPS 자동 리다이렉트, SSL 인증서 관리
- ⚡ **성능**: Gzip 압축, 캐싱 최적화
- 📱 **반응형**: 모든 디바이스 지원

---

## 🏗️ **아키텍처**

### **클라우드 인프라**
```
사용자 → Route 53 (DNS) → CloudFront (CDN) → S3 Bucket (정적 파일)
          ↓
    SSL 인증서 (ACM)
          ↓
    커스텀 도메인: www.cloudjet.click
```

### **기술 스택**
| 분야 | 기술 스택 |
|------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Hosting** | AWS S3 Static Website |
| **CDN** | AWS CloudFront |
| **DNS** | AWS Route 53 |
| **SSL** | AWS Certificate Manager (ACM) |
| **CI/CD** | GitHub Actions |
| **Code Quality** | SonarCloud, Slack Notifications |
| **Optimization** | Gzip Compression, Cache Headers |

---

## 🚀 **주요 기능**

### **사용자 기능**
- 🔍 **항공편 검색**: 출발지/도착지/날짜별 검색
- 📋 **예약 관리**: 예약 생성, 조회, 취소
- 💳 **결제 시스템**: Bootpay 결제 연동
- 👤 **사용자 관리**: 회원가입, 로그인, 프로필 관리
- 💺 **좌석 선택**: 항공편별 좌석 현황 및 선택

### **관리자 기능**
- 📊 **대시보드**: 예약 현황, 매출 통계
- ✈️ **항공편 관리**: 항공편 추가, 수정, 삭제
- 👥 **사용자 관리**: 회원 정보 조회 및 관리
- 💰 **결제 관리**: 결제 내역 조회 및 관리

---

## 🔧 **프로젝트 구조**

```
cjet-frontend/
├── index.html                    # 메인 페이지
├── admin.html                    # 관리자 페이지
├── css/
│   ├── styles.css               # 메인 스타일시트
│   └── admin-styles.css         # 관리자 스타일시트
├── js/
│   ├── config.js               # 환경별 설정 관리
│   ├── api.js                  # MSA API 통신 모듈
│   ├── storage.js              # 로컬 스토리지 관리
│   ├── auth.js                 # 인증 관리
│   ├── flight.js               # 항공편 검색
│   ├── booking.js              # 예약 관리
│   ├── payment.js              # 결제 처리
│   ├── pages.js                # 페이지 네비게이션
│   ├── utils.js                # 유틸리티 함수
│   └── admin-script.js         # 관리자 기능
├── images/                      # 이미지 파일
├── docs/                       # 설정 가이드
├── scripts/                    # 배포 스크립트
└── .github/workflows/          # GitHub Actions
```

---

## ⚙️ **환경별 설정**

### **자동 환경 감지 (js/config.js)**
```javascript
// 호스트명으로 환경 감지
function detectEnvironment() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') return 'development';
    if (hostname.includes('staging')) return 'staging';
    return 'production';
}

// 환경별 API 엔드포인트 자동 설정
const config = {
    development: { 
        API_BASE_URL: 'http://localhost:5000/api' 
    },
    staging: { 
        API_BASE_URL: 'https://api-staging.cloudjet.com/api' 
    },
    production: { 
        API_BASE_URL: 'https://api.cloudjet.click/api' 
    }
};
```

---

## 🚀 **로컬 개발 환경 설정**

### **Prerequisites**
- 최신 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 로컬 웹 서버 (Live Server, Python HTTP Server 등)
- Git

### **1. 프로젝트 클론**
```bash
git clone https://github.com/Cloud-Jet/cjet-frontend-public.git
cd cjet-frontend-public
```

### **2. 로컬 서버 실행**

#### **VS Code Live Server (추천)**
1. VS Code에서 프로젝트 열기
2. Live Server Extension 설치
3. `index.html` 우클릭 → "Open with Live Server"
4. http://localhost:5500 접속

#### **Python HTTP Server**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### **Node.js http-server**
```bash
npm install -g http-server
http-server -p 8000
```

### **3. 백엔드 연결**
로컬 개발 시 [cjet-backend-public](https://github.com/Cloud-Jet/cjet-backend-public) 실행 필요:
```bash
# 백엔드 서비스들이 다음 포트에서 실행되어야 함:
# Auth Service: localhost:5001
# Flight Service: localhost:5002
# Booking Service: localhost:5003
# Admin Service: localhost:5004
# Payment Service: localhost:5005
```

---

## 🌐 **배포된 환경**

### **접속 URL**
- **커스텀 도메인**: https://www.cloudjet.click
- **CloudFront**: https://d7aq35kj9vr3c.cloudfront.net
- **S3 웹사이트**: http://cloudjet-frontend-test.s3-website.ap-northeast-2.amazonaws.com

### **SSL 인증서**
- **도메인**: *.cloudjet.click, cloudjet.click
- **발급자**: AWS Certificate Manager (ACM)
- **지역**: US East (N. Virginia) - CloudFront 요구사항

---

## 🔄 **CI/CD 파이프라인**

### **GitHub Actions 자동 배포**
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS S3 and CloudFront

on:
  push:
    branches: [ main, production, frontend/ch ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Configure AWS credentials
      - Optimize static files (Gzip compression)
      - Deploy to S3
      - Invalidate CloudFront cache
      - Send deployment notification
```

### **배포 프로세스**
1. **코드 Push** → GitHub Actions 트리거
2. **파일 최적화** → Gzip 압축, 캐시 헤더 설정
3. **S3 동기화** → cloudjet-frontend-test 버킷 업로드
4. **CloudFront 무효화** → 전 세계 캐시 갱신
5. **배포 완료** → 5-10분 내 전 세계 반영

---

## 📊 **성능 최적화**

### **캐싱 전략**
| 파일 타입 | 캐시 시간 | 용도 |
|----------|---------|------|
| HTML 파일 | 5분 | 빠른 업데이트 반영 |
| CSS/JS 파일 | 1일 | 안정성과 성능 균형 |
| 이미지/폰트 | 1년 | 정적 리소스 최적화 |

### **압축 및 최적화**
- **Gzip 압축**: 모든 정적 파일 (60-80% 크기 절약)
- **CloudFront 압축**: 자동 Gzip/Brotli 지원
- **HTTP/2 지원**: 최신 프로토콜 활용
- **조건부 요청**: ETag 기반 캐시 최적화

---

## 🔐 **보안**

### **HTTPS 강제**
- **SSL/TLS**: Let's Encrypt 인증서 자동 갱신
- **리다이렉트**: HTTP → HTTPS 자동 리다이렉트
- **HSTS**: HTTP Strict Transport Security 헤더

### **환경 변수 보안**
```bash
# GitHub Secrets 설정
AWS_ACCESS_KEY_ID: [AWS 액세스 키]
AWS_SECRET_ACCESS_KEY: [AWS 시크릿 키]  
CLOUDFRONT_DISTRIBUTION_ID: [CloudFront 배포 ID]
SLACK_WEBHOOK_URL: [Slack 웹훅 URL]
SONAR_TOKEN: [SonarCloud 토큰]
```

---

## 📊 **코드 품질 관리**

### **SonarCloud 정적 분석**
- **품질 게이트**: PR 머지 전 자동 코드 품질 검증
- **보안 스캔**: JavaScript 보안 취약점 및 악성 코드 검사
- **코드 품질**: 코드 복잡도, 중복도, 유지보수성 측정
- **최적화 제안**: 성능 향상을 위한 코드 개선 가이드
- **실시간 모니터링**: [SonarCloud 대시보드](https://sonarcloud.io/project/overview?id=Cloud-Jet_cjet-frontend-public)

### **Slack 통합 알림**
- **채널**: `#ci-cd-alerts`
- **알림 이벤트**:
  - ✅ 코드 품질 검사 성공/실패
  - 🚀 배포 상태 (CloudFront 업데이트 포함)
  - ⚠️ 보안 취약점 발견 알림
  - 📊 품질 게이트 통과/실패

### **품질 메트릭 로컬 확인**
```bash
# SonarQube 로컬 스캔 실행
sonar-scanner \
  -Dsonar.projectKey=Cloud-Jet_cjet-frontend-public \
  -Dsonar.organization=cloud-jet \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=$SONAR_TOKEN
```

---

## 🧪 **API 연동**

### **MSA 백엔드 통신**
```javascript
// 인증이 필요한 API 호출
async function safeApiCall(endpoint, options = {}) {
    const user = Storage.getUser();
    if (user && user.token) {
        options.headers = {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return await response.json();
}
```

### **주요 API 엔드포인트**
- **인증**: `/api/auth/login`, `/api/auth/signup`
- **항공편**: `/api/flights/search`, `/api/airports`
- **예약**: `/api/bookings`, `/api/bookings/{id}/cancel`
- **결제**: `/api/payments/init`, `/api/payments/webhook`

---

## 💰 **비용 구조**

### **월별 예상 비용 (AWS)**
- **S3**: ~$0.50 (정적 웹사이트 호스팅)
- **CloudFront**: ~$0.085/GB (데이터 전송)
- **Route 53**: $0.50/월 (호스팅된 영역)
- **ACM**: 무료 (SSL 인증서)
- **총 예상**: 월 $1-5 (트래픽에 따라)

---

## 📱 **반응형 디자인**

### **지원 디바이스**
- **데스크톱**: 1920px 이상
- **태블릿**: 768px - 1024px
- **모바일**: 320px - 767px

### **주요 브레이크포인트**
```css
/* 태블릿 */
@media (max-width: 1024px) { ... }

/* 모바일 */
@media (max-width: 768px) { ... }

/* 소형 모바일 */
@media (max-width: 480px) { ... }
```

---

## 🛠️ **개발 도구**

### **권장 확장 프로그램 (VS Code)**
- **Live Server**: 로컬 개발 서버
- **Prettier**: 코드 포매팅
- **ESLint**: JavaScript 린팅
- **Auto Rename Tag**: HTML 태그 자동 수정

### **디버깅**
```javascript
// 개발 환경에서만 디버그 로그 출력
if (CONFIG.DEBUG) {
    console.log('Debug:', data);
}

// 환경별 설정 확인
console.log('Current Environment:', CONFIG.ENV);
console.log('API Base URL:', CONFIG.API_BASE_URL);
```

---

## 📝 **문서화**

### **관련 문서**
- **[CloudFront 설정 가이드](docs/cloudfront-setup-guide.md)**: AWS 콘솔 설정 방법
- **[GitHub Secrets 설정](docs/github-secrets-setup.md)**: CI/CD 환경 변수 설정
- **[배포 스크립트 가이드](scripts/README.md)**: 배포 프로세스 상세 설명

---

## 🚨 **트러블슈팅**

### **일반적인 문제**

#### **1. API 연결 오류**
```javascript
// 네트워크 연결 확인
if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('네트워크 연결 오류: API 서버에 접속할 수 없습니다.');
}
```

#### **2. 캐시 문제**
```bash
# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### **3. CORS 문제**
프론트엔드와 백엔드가 다른 도메인에서 실행될 때:
```javascript
// 백엔드에서 CORS 설정 필요
Access-Control-Allow-Origin: https://www.cloudjet.click
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 🤝 **기여 가이드라인**

### **개발 워크플로우**
1. **Fork** 및 **Clone**
2. **Feature Branch** 생성: `git checkout -b feature/amazing-feature`
3. **코드 작성** 및 **테스트**
4. **Commit**: `git commit -m 'Add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Pull Request** 생성

### **코드 스타일**
- **HTML**: 시맨틱 마크업 사용
- **CSS**: BEM 방법론 권장
- **JavaScript**: ES6+ 문법 사용
- **들여쓰기**: 스페이스 4칸

---

## 🗺️ **로드맵**

### **v1.0 (현재)**
- ✅ 기본 예약 시스템 구현
- ✅ CI/CD 파이프라인 구축
- ✅ AWS 클라우드 배포 완료
- ✅ 반응형 디자인 적용

### **v1.1 (계획)**
- 🔄 PWA (Progressive Web App) 지원
- 🔄 다국어 지원 (i18n)
- 🔄 다크모드 테마
- 🔄 성능 최적화 (Lazy Loading)

### **v2.0 (미래)**
- 🚀 React/Vue 마이그레이션
- 🚀 실시간 알림 시스템
- 🚀 AI 추천 시스템
- 🚀 소셜 로그인 지원

---

## 📞 **지원**

- **라이브 데모**: [https://www.cloudjet.click](https://www.cloudjet.click)
- **GitHub Issues**: [Frontend Issues](https://github.com/Cloud-Jet/cjet-frontend-public/issues)
- **관련 프로젝트**: [Backend Repository](https://github.com/Cloud-Jet/cjet-backend-public)
- **K8s 배포**: [Kubernetes Repository](https://github.com/Cloud-Jet/cjet-k8s-public)

---

**⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!** ⭐