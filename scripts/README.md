# CloudJet Frontend 배포 스크립트

CloudFront를 사용한 CI/CD 배포를 위한 스크립트 모음입니다.

## 📁 파일 구성

### 1. `build-optimize.sh`
프론트엔드 파일들을 최적화하고 압축하는 스크립트입니다.

**실행 방법:**
```bash
# Linux/macOS
./build-optimize.sh

# Windows (Git Bash 또는 WSL)
bash build-optimize.sh
```

**최적화 과정:**
- HTML/CSS/JS 파일 공백 정리 (주석 유지)
- Gzip 압축 버전 생성 (60-80% 크기 절약)
- 불필요한 파일 제거
- 파일 해시 생성
- 프로덕션 환경에서만 디버그 로그 제거

## 🚀 CI/CD 배포 과정

### 1. GitHub Actions 설정
`.github/workflows/deploy.yml` 파일을 사용하여 자동 배포가 설정됩니다.

### 2. GitHub Secrets 설정
다음 시크릿들을 GitHub 저장소에 설정해야 합니다:

```
AWS_ACCESS_KEY_ID: [AWS 액세스 키] ✅ 설정 완료
AWS_SECRET_ACCESS_KEY: [AWS 시크릿 키] ✅ 설정 완료
CLOUDFRONT_DISTRIBUTION_ID: [CloudFront 배포 ID] (AWS 콘솔에서 확인)
```

📖 자세한 설정 방법: [GitHub Secrets 설정 가이드](../docs/github-secrets-setup.md)

### 3. 배포 흐름

1. **코드 푸시** → GitHub Actions 트리거
2. **빌드 최적화** → 파일 압축 및 최적화
3. **S3 업로드** → 정적 파일들을 S3에 동기화
4. **CloudFront 캐시 무효화** → 전 세계 캐시 갱신
5. **배포 완료** → 사용자에게 즉시 반영

## 🌍 환경 구분

### Development (로컬)
- API URL: `http://localhost:5000/api`
- 디버깅 활성화
- 캐시 비활성화

### Production (CloudFront)
- S3 버킷: `cloudjet-frontend-test`
- API URL: `https://api.cloudjet.com/api` (자동 감지)
- 디버깅 비활성화
- 완전한 캐시 최적화

## 🔧 CloudFront 설정

📖 CloudFront 생성 방법: [CloudFront 설정 가이드](../docs/cloudfront-setup-guide.md)

## 📊 캐시 정책

### CloudFront 캐시 설정
- **HTML 파일**: 5분 (300초)
- **CSS/JS 파일**: 1일 (86400초)
- **이미지/폰트**: 1년 (31536000초)

### 캐시 무효화
배포 시 자동으로 전체 캐시(`/*`)가 무효화됩니다.

## 🛠️ 수동 배포

필요시 수동으로 배포할 수 있습니다:

```bash
# 1. 빌드 최적화
cd cjet-frontend
bash scripts/build-optimize.sh

# 2. S3 업로드
aws s3 sync build/ s3://cloudjet-frontend-production --delete

# 3. CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 📝 주의사항

1. **환경 변수**: `js/config.js`에서 자동으로 환경을 감지합니다.
2. **API 엔드포인트**: 환경별로 다른 API URL이 자동 설정됩니다.
3. **캐시 정책**: HTML 파일은 짧은 캐시, 정적 파일은 긴 캐시가 적용됩니다.
4. **보안**: API 키는 GitHub Secrets에만 저장하세요.

## 🔍 트러블슈팅

### AWS CLI 오류
```bash
# AWS 자격 증명 확인
aws sts get-caller-identity

# AWS CLI 설정
aws configure
```

### CloudFront 배포 상태 확인
```bash
# 배포 상태 확인
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

### 캐시 문제
브라우저에서 강제 새로고침 (Ctrl+F5) 또는 CloudFront 캐시 수동 무효화를 시도해보세요.
