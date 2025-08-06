# vue-packages

이 저장소는 **Nuxt 3/Vue 3 기반의 프론트엔드 및 데스크탑 앱 개발을 위한 모노레포**입니다.  
공통 UI/로직 패키지, SVG 기반 에디터, Electron 데스크탑 앱 등 다양한 프로젝트가 통합 관리됩니다.

## 📦 패키지 구성

- **core**  
  Nuxt 3/Vue 3 기반의 재사용 가능한 컴포넌트 및 Composables 라이브러리
  - 제스처 인식, 오버레이, 커스텀 스크롤 등 실용 기능 제공
  - [core/README.md](./core/README.md) 참고

- **svg-mapper**  
  SVG 기반 폴리곤/도면 에디터 (Nuxt 3, Vue 3, TailwindCSS)
  - 프로젝트/캔버스/레이어 관리, 다양한 도구, 직관적 단축키, JSON 저장 등
  - [svg-mapper/README.md](./svg-mapper/README.md) 참고

- **electron-app**  
  Nuxt 프로젝트를 데스크탑 앱으로 패키징하는 Electron 앱
  - cross-platform 빌드 지원
  - [electron-app/package.json](./electron-app/package.json) 참고

## 🛠️ 개발 환경

- **패키지 매니저:** yarn (v4 이상 권장)
- **Node.js:** 18 이상

### 설치 및 실행

```bash
# 저장소 및 서브모듈까지 한 번에 클론
git clone --recurse-submodules https://github.com/aldegad/nuxt-packages.git
cd nuxt-packages

# 의존성 설치 (모든 패키지 일괄)
yarn install

# 각 패키지별 개발 서버 실행 예시
yarn dev:core
yarn dev:svg-mapper
yarn electron:svg-mapper
```

### 주요 스크립트

- `yarn dev:core` : core 패키지 개발 서버
- `yarn dev:svg-mapper` : svg-mapper 개발 서버
- `yarn electron:svg-mapper` : svg-mapper를 Electron으로 실행
- 기타 상세 스크립트는 각 패키지의 README 및 package.json 참고

## 🤝 기여 및 참고

- 각 패키지별 상세 설명, 사용법, 기여 가이드는 하위 폴더의 README.md를 참고하세요.
- Pull Request/Issue는 각 패키지 또는 루트 저장소에서 자유롭게 등록해 주세요.
