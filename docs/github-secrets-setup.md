# GitHub Secrets 설정 가이드

## 🔐 필요한 Secret 값들

### ✅ 이미 설정 완료
- `AWS_ACCESS_KEY_ID` ✅
- `AWS_SECRET_ACCESS_KEY` ✅

### 📋 추가로 설정해야 할 값

#### `CLOUDFRONT_DISTRIBUTION_ID`
**어디서 확인?**
1. AWS 콘솔 → CloudFront 서비스
2. 생성된 배포를 클릭
3. **일반** 탭에서 "배포 ID" 복사

**예시:**
```
E1234567890ABC
```

**GitHub에서 설정:**
1. GitHub 저장소 → Settings
2. Secrets and variables → Actions
3. "New repository secret" 클릭
4. **Name:** `CLOUDFRONT_DISTRIBUTION_ID`
5. **Secret:** [복사한 배포 ID]

## 🚀 전체 설정 완료 후 테스트

### 설정 확인 체크리스트
- [ ] `AWS_ACCESS_KEY_ID` ✅ (완료)
- [ ] `AWS_SECRET_ACCESS_KEY` ✅ (완료)  
- [ ] `CLOUDFRONT_DISTRIBUTION_ID` (CloudFront 생성 후 설정)

### 배포 테스트 방법
1. `cjet-frontend` 폴더의 파일을 수정
2. GitHub에 푸시
3. Actions 탭에서 배포 진행 상황 확인
4. CloudFront URL로 접속하여 확인

## 📊 CloudFront 정보 확인 방법

### 배포 도메인 이름 확인
1. AWS 콘솔 → CloudFront → 배포 선택
2. **일반** 탭에서 "배포 도메인 이름" 확인
3. 예시: `https://d1234567890.cloudfront.net`

### 배포 상태 확인
- **배포됨**: 사용 가능 ✅
- **진행 중**: 배포 진행 중 ⏳ (5-15분 소요)
- **비활성화됨**: 배포 중지됨 ❌

## 🔍 추가 설정 (선택사항)

현재 구성으로는 필요하지 않지만, 향후 확장 시 고려할 수 있는 설정들:

### 도메인 연결 시 추가 필요한 Secrets
```bash
# 사용자 정의 도메인 사용 시
DOMAIN_NAME=cloudjet.com
SSL_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789:certificate/...
```

### Slack 알림 연결 시
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 환경별 분리 시
```bash
# 현재는 단일 환경이므로 불필요
S3_BUCKET_STAGING=cloudjet-frontend-staging
S3_BUCKET_PRODUCTION=cloudjet-frontend-production
```

## ⚠️ 보안 주의사항

### Secret 값 관리
1. **절대 코드에 하드코딩하지 않기**
2. **로컬 환경에서 .env 파일 사용 시 .gitignore에 추가**
3. **정기적으로 AWS 액세스 키 로테이션**

### AWS 권한 최소화
현재 필요한 최소 권한:
- S3: `GetObject`, `PutObject`, `DeleteObject`, `ListBucket`
- CloudFront: `CreateInvalidation`, `GetDistribution`

## 🎯 다음 단계

1. CloudFront 배포 생성 ([가이드](./cloudfront-setup-guide.md) 참조)
2. `CLOUDFRONT_DISTRIBUTION_ID` 복사하여 GitHub Secrets에 등록
3. 코드 푸시하여 자동 배포 테스트
4. CloudFront URL로 사이트 접속 확인

배포가 완료되면 전 세계 어디서든 빠른 속도로 CloudJet 사이트에 접속할 수 있습니다! 🌍✈️


