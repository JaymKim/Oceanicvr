# Oceanic VR Dive

Oceanic VR Dive는 React로 개발된 웹 기반 플랫폼으로, 누구나 가상현실을 통해 스쿠버 다이빙을 체험하고 커뮤니티 기능을 이용할 수 있도록 합니다. Firebase를 통해 인증과 데이터베이스, 파일 스토리지를 제공하며, Google Maps API를 활용해 투어 위치 정보를 표시합니다.

## 설치 방법

1. Node.js가 설치되어 있어야 합니다.
2. 저장소 클론 후 의존성을 설치합니다.

```bash
npm install
```

## 사용 스크립트

- `npm start` – 개발 서버 실행
- `npm run build` – 프로덕션 빌드 생성
- `npm test` – 테스트 실행 (테스트가 있을 경우)
- `npm run eject` – create-react-app 설정 추출

## 환경 변수

`.env` 파일에 다음 값을 설정해야 합니다.

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

필요에 따라 `src/firebase.js`의 Firebase 설정도 자신의 프로젝트 값으로 변경해야 합니다.

## 주요 기능

- 회원 가입 및 로그인
- 자유게시판, Q&A, 투어 신청 등 커뮤니티 기능
- 갤러리 업로드 및 투어 영상 관리
- VR 투어 포인트 확인 및 쇼핑몰 기능
- 관리자와 강사를 위한 전용 페이지 제공

## 빌드 결과 배포

프로덕션 빌드 결과는 `build/` 디렉터리에 생성되며, Vercel 등 정적 호스팅 서비스로 배포할 수 있습니다.

