# @aldegad/nuxt-core

Vue 3 & Nuxt 3 기반의 컴포넌트 및 Composables 라이브러리입니다. 다른 Nuxt 프로젝트에서 재사용할 수 있도록, 제스처 인식, 오버레이, 커스텀 스크롤 등 실용적인 기능만을 제공합니다.

- **레포지토리:** [github.com/aldegad/nuxt-core](https://github.com/aldegad/nuxt-core)
- **모노레포:** [github.com/aldegad/nuxt-packages](https://github.com/aldegad/nuxt-packages)

## 설치

```bash
npm install @aldegad/nuxt-core
# 또는
yarn add @aldegad/nuxt-core
```

## 빠른 시작

```js
// 주요 컴포넌트 import
import { ColorPicker, Overlay, OverlayContextProvider, ScrollView } from "@aldegad/nuxt-core";
// 주요 composable import
import { useGesture, useOverlayContext } from "@aldegad/nuxt-core";
// 스타일 적용
import "@aldegad/nuxt-core/style.css";
```

## 주요 컴포넌트

- `ColorPicker`: 색상 선택
- `Overlay`, `OverlayContextProvider`: 오버레이 시스템
- `ScrollView`: 커스텀 스크롤 뷰

## 주요 Composables

- `useGesture`: 제스처 인식
- `useOverlayContext`: 오버레이 컨텍스트

## 스타일 적용

```js
import "@aldegad/nuxt-core/style.css";
```

## 빌드 및 배포 (개발자용)

```bash
# 빌드
npm run build:lib
# 배포
npm publish --access public
```

## 프로젝트 구조

```
src/
├── components/   # Vue 컴포넌트
├── composables/  # Vue Composables
├── schemas/      # 타입 정의
├── stores/       # Pinia 스토어
├── utils/        # 유틸리티 함수
└── assets/       # 스타일 및 폰트
```

## 라이선스

MIT
