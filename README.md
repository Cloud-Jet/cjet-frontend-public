# cjet-frontend
## **CloudJet Frontend 클라우드 인프라 구축 프로젝트**

**�� 프로젝트 개요**

**목표**: 정적 웹사이트를 AWS 클라우드 인프라에 배포하여 글로벌 CDN 구축

**기간**: 2025년 8월 18일

**결과**: 완벽한 CI/CD 파이프라인과 커스텀 도메인 구축 완료

---

## **��️ 구축된 인프라 아키텍처**

### **1. 핵심 서비스 구성**

- **S3 (Simple Storage Service)**: 정적 웹사이트 호스팅
- **CloudFront**: 글로벌 CDN 및 캐싱
- **Route 53**: DNS 관리 및 커스텀 도메인
- **ACM (AWS Certificate Manager)**: SSL 인증서 관리
- **GitHub Actions**: CI/CD 자동화

**2. 네트워크 구성**

```bash
**사용자 → CloudFront (글로벌 CDN) → S3 버킷 (정적 파일)   
			↓ 

커스텀 도메인: www.cloudjet.click  

 HTTPS 자동 리다이렉트**   
```

      ****

---

## **�� 프로젝트 파일 구조**

**핵심 파일들** 

<aside>

**cjet-frontend/**

**└── github-secrets-setup.md      # GitHub Secrets 설정 가이드**

**├── cloudfront-setup-guide.md    # CloudFront 설정 가이드**    

**└── docs/                           # 설정 가이드**    

**├── admin.html                       # 관리자 페이지**

**├── index.html                       # 메인 페이지**

**├── images/                          # 이미지 파일**

**├── css/                             # 스타일시트**

**│   └── storage.js                   # 로컬 스토리지 관리**

**│   ├── api.js                       # API 호출 모듈**

**│   ├── config.js                    # 환경별 설정 관리**

**├── js/**

**├── .github/workflows/deploy.yml     # GitHub Actions CI/CD**

</aside>

---

## **🔧 주요 구현 내용**

**1. 환경별 설정 자동화 (js/config.js)javascript**

```jsx
***// 개발/스테이징/프로덕션 환경 자동 감지*function detectEnvironment() {
    const hostname = window.location.hostname;
    if (hostname.includes('localhost')) return 'development';
    if (hostname.includes('staging')) return 'staging';
    return 'production';}
*// 환경별 API 엔드포인트 자동 설정*
const config = {
    development: { API_BASE_URL: 'http://localhost:5000/api' },
    staging: { API_BASE_URL: 'https://api-staging.cloudjet.com/api' },
    production: { API_BASE_URL: 'https://api.cloudjet.com/api' }};**
```

**2. GitHub Actions CI/CD 파이프라인**

```yaml
***# 자동 배포 트리거*
on:  
	push:    
		branches: [ main, production, frontend/ch ]
		paths: [ '**' ]
*# 배포 단계*
steps:
  - Checkout code
  - Setup environment
  - Configure AWS credentials
  - Build frontend
  - Optimize static files (Gzip 압축)
  - Deploy to S3
  - Invalidate CloudFront cache
  - Deployment summary**
```

### **3. 정적 파일 최적화**

- **HTML**: 공백 정리, 주석 유지 (팀 가독성)
- **CSS**: 공백 정리, 개발 주석 유지
- **JavaScript**: 개발 주석 유지, 프로덕션 로그 제거
- **Gzip 압축**: 모든 정적 파일에 적용

---

## **🌐 도메인 및 URL 설정**

### **접속 가능한 URL들**

- **커스텀 도메인**: https://www.cloudjet.click
- **CloudFront**: https://d7aq35kj9vr3c.cloudfront.net
- **S3 웹사이트**: http://cloudjet-frontend-test.s3-website.ap-northeast-2.amazonaws.com

### **SSL 인증서**

- **도메인**: *.cloudjet.click, cloudjet.click
- **인증서 ID**: f368653a-7fde-4e0f-82b8-cb1944975f09
- **지역**: US East (N. Virginia) - CloudFront 요구사항

---

## **🔐 보안 및 인증 설정**

### **GitHub Secrets**

- AWS_ACCESS_KEY_ID: AWS IAM 사용자 액세스 키
- AWS_SECRET_ACCESS_KEY: AWS IAM 사용자 시크릿 키
- CLOUDFRONT_DISTRIBUTION_ID: CloudFront 배포 ID

### **AWS IAM 권한**

- S3 버킷 접근 권한
- CloudFront 캐시 무효화 권한
- Route 53 DNS 관리 권한

---

## **�� 성능 최적화**

### **캐싱 전략**

- **HTML 파일**: 5분 캐시 (빠른 업데이트)
- **CSS/JS 파일**: 24시간 캐시 (안정성)
- **이미지/폰트**: 1년 캐시 (최적화)

### **압축 및 최적화**

- **Gzip 압축**: 모든 정적 파일
- **CloudFront 압축**: 자동 Gzip/Brotli 지원
- **HTTP/2 지원**: 최신 프로토콜 활용

---

## **�� 배포 프로세스**

### **자동 배포 흐름**

1. **코드 푸시** → frontend/ch 브랜치
2. **GitHub Actions 자동 실행** → Ubuntu 환경에서 빌드
3. **정적 파일 최적화** → Gzip 압축, 캐시 헤더 설정
4. **S3 동기화** → cloudjet-frontend-test 버킷에 업로드
5. **CloudFront 캐시 무효화** → 새로운 콘텐츠 즉시 반영
6. **글로벌 배포 완료** → 5-10분 내 전 세계 반영

### **수동 배포 옵션**

- **GitHub Actions**: workflow_dispatch 트리거로 수동 실행 가능
- **CloudFront**: AWS 콘솔에서 수동 캐시 무효화 가능

---

## **�� 비용 구조**

### **월별 예상 비용**

- **S3**: 약 $0.50 (정적 웹사이트 호스팅)
- **CloudFront**: 데이터 전송량에 따라 (약 $0.085/GB)
- **Route 53**: $0.50/월 (호스팅된 영역)
- **ACM**: SSL 인증서 무료
- **총 예상**: 월 $1-5 (트래픽에 따라)

---

## **�� 주요 성과**

### **기술적 성과**

- ✅ **완벽한 CI/CD 파이프라인** 구축
- ✅ **글로벌 CDN**을 통한 전 세계 배포
- ✅ **자동 SSL 인증서** 관리
- ✅ **커스텀 도메인** 설정 완료
- ✅ **성능 최적화** (Gzip, 캐싱)

### **비즈니스 가치**

- 🌍 **글로벌 접근성**: 전 세계 어디서든 빠른 접속
- �� **보안**: HTTPS 자동 리다이렉트
- ⚡ **성능**: CDN을 통한 빠른 로딩
- �� **확장성**: 트래픽 증가에 자동 대응
- �� **비용 효율**: 서버리스 아키텍처

---

## **�� 문서화 및 가이드**

### **생성된 문서들**

1. **CloudFront 설정 가이드**: AWS 콘솔에서 수동 설정 방법
2. **GitHub Secrets 설정 가이드**: 필요한 시크릿 값 설정 방법
3. **GitHub 저장소 연결 가이드**: 로컬 코드를 GitHub에 연결하는 방법

### **팀원 교육 자료**

- **배포 프로세스**: 코드 푸시부터 배포까지의 전체 흐름
- **문제 해결**: 일반적인 오류와 해결 방법
- **모니터링**: CloudFront 및 S3 상태 확인 방법

---

## **�� 향후 개선 계획**

### **단기 계획 (1-3개월)**

- [ ]  [ ] **모니터링 도구** 구축 (CloudWatch, DataDog 등)
- [ ]  [ ] **백업 전략** 수립 (S3 버전 관리, 크로스 리전 복제)
- [ ]  [ ] **성능 테스트** 및 최적화

### **중장기 계획 (3-12개월)**

- [ ]  [ ] **다중 환경** 구축 (개발/스테이징/프로덕션)
- [ ]  [ ] **자동화 테스트** 통합 (Jest, Cypress 등)
- [ ]  [ ] **마이크로프론트엔드** 아키텍처 검토

---

## **🎉 프로젝트 완료 요약**

**CloudJet Frontend 클라우드 인프라 구축 프로젝트가 성공적으로 완료되었습니다!**

### **핵심 성과**

- �� **글로벌 CDN**: CloudFront를 통한 전 세계 배포
- 🔄 **자동 배포**: GitHub Actions를 통한 CI/CD
- 🔒 **보안**: HTTPS 및 SSL 인증서 자동 관리
- ⚡ **성능**: Gzip 압축, 캐싱 최적화
- 🎯 **브랜딩**: www.cloudjet.click 커스텀 도메인

### **기술 스택**

- **AWS**: S3, CloudFront, Route 53, ACM
- **CI/CD**: GitHub Actions
- **프론트엔드**: HTML5, CSS3, JavaScript (ES6+)
- **최적화**: Gzip 압축, 캐싱 전략

**이제 CloudJet이 전 세계 어디서든 빠르고 안전하게 접속 가능한 글로벌 서비스로 운영됩니다!** 🚀✨
# test