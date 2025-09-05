# AWS 콘솔에서 CloudFront 생성 가이드

## 📋 사전 준비
- AWS 계정 및 S3 버킷 (`cloudjet-frontend-test`) 준비 완료
- AWS 콘솔 로그인

## 🚀 CloudFront 배포 생성 단계

### 1단계: CloudFront 서비스 접속
1. AWS 콘솔에서 "CloudFront" 검색 후 선택
2. "배포 생성" 버튼 클릭

### 2단계: 오리진(Origin) 설정

⚠️ **중요**: S3 웹사이트 엔드포인트 사용 권장

**오리진 도메인 (권장):**
```
cloudjet-frontend-test.s3-website.ap-northeast-2.amazonaws.com
```

**오리진 경로:** (비워둠)

**이름:** `cloudjet-frontend-test-origin` (자동 생성)

**오리진 액세스:** 
- **"퍼블릭"** 선택 (웹사이트 엔드포인트는 OAC 지원 안함)

**프로토콜:** HTTP Only (S3 웹사이트는 HTTPS 미지원, CloudFront에서 HTTPS 처리)

> **참고**: 웹사이트 엔드포인트 사용 시 OAC 대신 버킷 정책으로 보안 관리

### 3단계: 기본 캐시 동작 설정
**뷰어 프로토콜 정책:** "Redirect HTTP to HTTPS"

**허용된 HTTP 방법:** "GET, HEAD"

**캐시 키 및 오리진 요청:**
- "캐시 정책 및 오리진 요청 정책" 선택
- **캐시 정책:** "Managed-CachingOptimized"
- **오리진 요청 정책:** 없음

**응답 헤더 정책:** 없음

### 4단계: 함수 연결 (선택사항)
- 설정하지 않음

### 5단계: 설정
**가격 등급:** "가격 등급 100 사용 (미국, 캐나다, 유럽, 아시아만)"

**대체 도메인 이름 (CNAME):** (나중에 설정 가능)

**SSL 인증서:** "기본 CloudFront SSL 인증서 사용"

**지원되는 HTTP 버전:** "HTTP/2"

**기본 루트 객체:** 
```
index.html
```

**표준 로깅:** 꺼짐

**IPv6:** 켜짐

**설명:** `CloudJet Frontend Distribution`

### 6단계: 사용자 정의 오류 페이지 설정 (선택사항)
S3 웹사이트 엔드포인트 사용 시 자동으로 처리되지만, 추가 설정 가능:

**오류 페이지 1:**
- **HTTP 오류 코드:** 403
- **사용자 정의 오류 응답:** 예
- **응답 페이지 경로:** `/index.html`
- **HTTP 응답 코드:** 200

**오류 페이지 2:**
- **HTTP 오류 코드:** 404  
- **사용자 정의 오류 응답:** 예
- **응답 페이지 경로:** `/index.html`
- **HTTP 응답 코드:** 200

> **참고**: S3 웹사이트 엔드포인트는 이미 404 → index.html 리다이렉트를 지원하므로 중복 설정

### 7단계: 추가 캐시 동작 설정 (권장)

#### HTML 파일 캐시 설정
**경로 패턴:** `*.html`
- **오리진:** cloudjet-frontend-test-origin
- **뷰어 프로토콜 정책:** Redirect HTTP to HTTPS
- **캐시 정책:** "Managed-CachingDisabled" (짧은 캐시)
- **TTL:** 최소 0, 최대 300, 기본 300 (5분)

#### CSS/JS 파일 캐시 설정  
**경로 패턴:** `*.css`
- **오리진:** cloudjet-frontend-test-origin
- **뷰어 프로토콜 정책:** Redirect HTTP to HTTPS
- **캐시 정책:** "Managed-CachingOptimized"
- **TTL:** 최소 0, 최대 31536000, 기본 86400 (1일)

**경로 패턴:** `*.js`
- 위와 동일한 설정

### 8단계: 배포 생성 완료
1. "배포 생성" 버튼 클릭
2. 배포 생성 완료 (약 5-15분 소요)

## 📝 배포 완료 후 설정

### S3 버킷 정책 업데이트
S3 웹사이트 엔드포인트 사용 시 다음 정책 적용:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::cloudjet-frontend-test/*"
        }
    ]
}
```

⚠️ **보안 참고**: 웹사이트 엔드포인트는 퍼블릭 액세스가 필요하지만, CloudFront를 통해서만 접근하도록 제한 가능

### GitHub Secrets에 배포 ID 등록
CloudFront 배포 완료 후:
1. 배포 목록에서 생성된 배포의 **배포 ID** 복사
2. GitHub 저장소 Settings → Secrets → Actions에서 설정:
   - **Name:** `CLOUDFRONT_DISTRIBUTION_ID`
   - **Value:** [복사한 배포 ID]

## 🌍 CloudFront 도메인 확인
배포 완료 후 **배포 도메인 이름** 확인:
```
https://d1234567890.cloudfront.net
```

## ⚡ 성능 최적화 팁

### 1. Gzip 압축 활성화
CloudFront에서 자동으로 활성화됨 (Compress objects automatically: Yes)

### 2. 캐시 정책 최적화
- **HTML**: 5분 캐시 (빠른 업데이트)
- **CSS/JS**: 1일 캐시 (성능 최적화)
- **이미지**: 1년 캐시 (최대 성능)

### 3. HTTP/2 지원
기본적으로 활성화되어 다중 요청 병렬 처리

### 4. 지역별 엣지 로케이션
아시아-태평양 지역 최적화로 한국 사용자 빠른 접근

## 🔧 문제 해결

### 캐시 무효화
배포 후 변경사항이 즉시 반영되지 않는 경우:
1. CloudFront 콘솔 → 배포 선택
2. "무효화" 탭 → "무효화 생성"
3. **객체 경로:** `/*` (전체 캐시 무효화)

### CORS 오류 해결
S3 버킷에 CORS 정책 추가:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```
