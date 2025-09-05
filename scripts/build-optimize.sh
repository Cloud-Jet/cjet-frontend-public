#!/bin/bash

# CloudJet Frontend 빌드 최적화 스크립트

set -e

echo "🔧 Frontend 빌드 최적화 시작..."

# 현재 디렉토리 확인
if [ ! -f "index.html" ]; then
    echo "❌ index.html을 찾을 수 없습니다. cjet-frontend 디렉토리에서 실행해주세요."
    exit 1
fi

# 임시 빌드 디렉토리 생성
BUILD_DIR="build"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

echo "📦 파일 복사 중..."

# 모든 파일 복사
cp -r . $BUILD_DIR/
cd $BUILD_DIR

# 불필요한 파일/디렉토리 제거
rm -rf .git* scripts/ build/ node_modules/ *.md

echo "🗜️ 파일 압축 및 최적화 중..."

# HTML 파일 최적화 (공백 정리만, 주석 유지)
optimize_html() {
    local file=$1
    echo "Optimizing HTML: $file"
    
    # 팀 협업을 위해 주석은 유지하고 공백만 정리
    # 빈 줄 제거
    sed -i '/^[[:space:]]*$/d' "$file"
    # 연속된 공백을 하나로 변경
    sed -i 's/[[:space:]]\+/ /g' "$file"
}

# CSS 파일 최적화 (공백 정리, 개발 주석 유지)
optimize_css() {
    local file=$1
    echo "Optimizing CSS: $file"
    
    # 팀 협업을 위해 주석은 유지하고 공백만 최적화
    # 빈 줄 제거
    sed -i '/^[[:space:]]*$/d' "$file"
    # 불필요한 공백 정리 (가독성 유지)
    sed -i 's/ {/{/g' "$file"
    sed -i 's/; /;/g' "$file"
}

# JS 파일 최적화 (개발 주석 유지, 프로덕션 로그만 제거)
optimize_js() {
    local file=$1
    echo "Optimizing JS: $file"
    
    # 프로덕션에서만 디버그 로그 제거 (개발 주석은 유지)
    if [ "$DEPLOY_ENV" = "production" ]; then
        # console.log와 console.debug만 제거 (console.error는 유지)
        sed -i '/console\.log/d' "$file"
        sed -i '/console\.debug/d' "$file"
        # TODO 주석과 FIXME 주석은 유지
        echo "  - 프로덕션 빌드: 디버그 로그 제거됨"
    fi
    
    # 빈 줄만 제거 (주석은 유지)
    sed -i '/^[[:space:]]*$/d' "$file"
}

# HTML 파일들 최적화
find . -name "*.html" -type f | while read file; do
    optimize_html "$file"
done

# CSS 파일들 최적화
find css -name "*.css" -type f | while read file; do
    optimize_css "$file"
done

# JS 파일들 최적화
find js -name "*.js" -type f | while read file; do
    optimize_js "$file"
done

echo "📝 파일 정보 생성 중..."

# 빌드 정보 파일 생성
cat > build-info.json << EOF
{
    "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "environment": "${DEPLOY_ENV:-development}",
    "version": "${GITHUB_SHA:-local}",
    "branch": "${GITHUB_REF_NAME:-local}"
}
EOF

# Gzip 압축 버전 생성 (CloudFront에서 사용)
echo "🗜️ Gzip 압축 파일 생성 중..."

# HTML 파일 압축
find . -name "*.html" -type f -exec gzip -k9 {} \;

# CSS 파일 압축
find css -name "*.css" -type f -exec gzip -k9 {} \;

# JS 파일 압축
find js -name "*.js" -type f -exec gzip -k9 {} \;

# SVG 파일 압축
find . -name "*.svg" -type f -exec gzip -k9 {} \;

# JSON 파일 압축
find . -name "*.json" -type f -exec gzip -k9 {} \;

echo "📊 빌드 결과 분석..."

# 파일 크기 분석
total_size=$(du -sh . | cut -f1)
html_size=$(find . -name "*.html" -type f -exec du -ch {} + | tail -1 | cut -f1)
css_size=$(find css -name "*.css" -type f -exec du -ch {} + | tail -1 | cut -f1 2>/dev/null || echo "0")
js_size=$(find js -name "*.js" -type f -exec du -ch {} + | tail -1 | cut -f1 2>/dev/null || echo "0")

# 압축 효율 계산
gzip_html_size=$(find . -name "*.html.gz" -type f -exec du -ch {} + | tail -1 | cut -f1 2>/dev/null || echo "0")
gzip_css_size=$(find css -name "*.css.gz" -type f -exec du -ch {} + | tail -1 | cut -f1 2>/dev/null || echo "0")
gzip_js_size=$(find js -name "*.js.gz" -type f -exec du -ch {} + | tail -1 | cut -f1 2>/dev/null || echo "0")

echo ""
echo "📈 빌드 결과:"
echo "  전체 크기: $total_size"
echo "  HTML 크기: $html_size (압축: $gzip_html_size)"
echo "  CSS 크기: $css_size (압축: $gzip_css_size)"
echo "  JS 크기: $js_size (압축: $gzip_js_size)"
echo ""

# 캐시 정책을 위한 파일 해시 생성
echo "🔒 파일 무결성 해시 생성..."
find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -exec md5sum {} \; > file-hashes.txt

echo "✅ 빌드 최적화 완료!"
echo "📁 최적화된 파일들이 '$BUILD_DIR' 디렉토리에 준비되었습니다."

cd ..
echo "🚀 S3 업로드 준비 완료!"
