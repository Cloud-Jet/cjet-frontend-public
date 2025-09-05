# GitHub 저장소 연결 방법

## 📋 단계별 설정

### 1단계: GitHub에서 저장소 생성
1. GitHub.com 접속 → 로그인
2. "New repository" 클릭
3. Repository name: `cloudjet-frontend`
4. Description: `CloudJet 항공 예약 시스템 프론트엔드 - CloudFront CI/CD`
5. Public 또는 Private 선택
6. "Create repository" 클릭

### 2단계: 로컬에서 연결 (PowerShell에서 실행)
```powershell
# GitHub 저장소 URL을 실제 URL로 교체
git remote add origin https://github.com/YOUR_USERNAME/cloudjet-frontend.git
git branch -M main
git push -u origin main
```

### 3단계: GitHub Secrets 설정
저장소 생성 후 Settings → Secrets and variables → Actions에서 설정:

✅ **이미 설정됨:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

⏳ **CloudFront 생성 후 추가:**
- `CLOUDFRONT_DISTRIBUTION_ID`

### 4단계: Actions 활성화 확인
1. GitHub 저장소 → Actions 탭
2. "I understand my workflows, go ahead and enable them" 클릭
3. 워크플로우 활성화 확인

## 🚀 테스트 배포
저장소 연결 후 파일 수정하여 배포 테스트:
```powershell
# 파일 수정 후
git add .
git commit -m "Test CloudFront deployment"
git push origin main
```

그러면 GitHub Actions가 자동으로 실행됩니다!


