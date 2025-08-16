// 카메라 최적화 테스트: 실제 Vue ref vs 일반 자바스크립트 객체

// 실제 Vue의 ref와 shallowRef를 import
import { ref, shallowRef, toRaw, triggerRef } from "vue";

// 테스트용 카메라 상태
const createCameraState = () => ({
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  zoom: 1,
});

// 테스트용 플레이어 생성
const createPlayer = () => ({
  x: Math.random() * 1000,
  y: Math.random() * 1000,
  width: 128,
  height: 128,
});

// 방법 1: 실제 Vue ref를 사용한 방식 (현재 방식)
const realVueRefCamera = () => {
  const cameraState = createCameraState();
  const followTarget = ref(createPlayer());
  const isFollowEnabled = ref(true);

  const update = (deltaTime = 16.67) => {
    if (isFollowEnabled.value && followTarget.value) {
      const t = followTarget.value;
      const targetCenterX = t.x + t.width / 2;
      const targetCenterY = t.y + t.height / 2;
      const desiredX =
        targetCenterX - cameraState.width / (2 * cameraState.zoom);
      const desiredY =
        targetCenterY - cameraState.height / (2 * cameraState.zoom);

      const k = 0.008;
      const alpha = 1 - Math.exp(-k * deltaTime);
      cameraState.x += (desiredX - cameraState.x) * alpha;
      cameraState.y += (desiredY - cameraState.y) * alpha;
    }
  };

  return { update, followTarget, isFollowEnabled };
};

// 방법 2: 실제 shallowRef를 사용한 방식
const realShallowRefCamera = () => {
  const cameraState = createCameraState();
  let followTarget = createPlayer(); // 일반 자바스크립트 객체
  const followTargetRef = shallowRef(followTarget);
  let isFollowEnabled = true; // 일반 boolean

  const update = (deltaTime = 16.67) => {
    if (isFollowEnabled && followTarget) {
      const t = followTarget;
      const rawState = cameraState;
      const targetCenterX = t.x + t.width / 2;
      const targetCenterY = t.y + t.height / 2;
      const desiredX = targetCenterX - rawState.width / (2 * rawState.zoom);
      const desiredY = targetCenterY - rawState.height / (2 * rawState.zoom);

      const k = 0.008;
      const alpha = 1 - Math.exp(-k * deltaTime);
      rawState.x += (desiredX - rawState.x) * alpha;
      rawState.y += (desiredY - rawState.y) * alpha;

      // shallowRef는 객체 내부 변경을 자동 감지하지 않으므로 수동 트리거 필요
      cameraState.value = { ...rawState };
      triggerRef(followTargetRef);
    }
  };

  const setFollowTarget = (target) => {
    followTarget = target;
  };

  return {
    update,
    setFollowTarget,
    followTarget: () => followTarget,
    isFollowEnabled: () => isFollowEnabled,
  };
};

// 방법 3: 일반 자바스크립트 객체 방식 (순수 JS)
const pureJsCamera = () => {
  const cameraState = createCameraState();
  let followTarget = createPlayer();
  let isFollowEnabled = true;

  const update = (deltaTime = 16.67) => {
    if (isFollowEnabled && followTarget) {
      const t = followTarget;
      const targetCenterX = t.x + t.width / 2;
      const targetCenterY = t.y + t.height / 2;
      const desiredX =
        targetCenterX - cameraState.width / (2 * cameraState.zoom);
      const desiredY =
        targetCenterY - cameraState.height / (2 * cameraState.zoom);

      const k = 0.008;
      const alpha = 1 - Math.exp(-k * deltaTime);
      cameraState.x += (desiredX - cameraState.x) * alpha;
      cameraState.y += (desiredY - cameraState.y) * alpha;
    }
  };

  return {
    update,
    followTarget: () => followTarget,
    isFollowEnabled: () => isFollowEnabled,
  };
};

// 방법 3: 미세 최적화 포함 (비트 시프트, 덧셈 등)
const microOptimizedCamera = () => {
  const cameraState = createCameraState();
  let followTarget = createPlayer();
  let isFollowEnabled = true;

  const update = (deltaTime = 16.67) => {
    if (isFollowEnabled && followTarget) {
      const t = followTarget;
      const targetCenterX = t.x + (t.width >> 1); // 비트 시프트
      const targetCenterY = t.y + (t.height >> 1);
      const desiredX =
        targetCenterX -
        cameraState.width / (cameraState.zoom + cameraState.zoom); // 덧셈
      const desiredY =
        targetCenterY -
        cameraState.height / (cameraState.zoom + cameraState.zoom);

      const k = 0.008;
      const alpha = 1 - Math.exp(-k * deltaTime);
      cameraState.x += (desiredX - cameraState.x) * alpha;
      cameraState.y += (desiredY - cameraState.y) * alpha;
    }
  };

  return {
    update,
    followTarget: () => followTarget,
    isFollowEnabled: () => isFollowEnabled,
  };
};

// 방법 5: toRaw 최적화를 포함한 Vue ref 방식
const toRawOptimizedCamera = () => {
  const cameraState = createCameraState();
  const followTarget = ref(createPlayer());
  const isFollowEnabled = ref(true);

  const update = (deltaTime = 16.67) => {
    // toRaw로 반응성 오버헤드 제거
    const rawFollowEnabled = toRaw(isFollowEnabled.value);
    const rawFollowTarget = toRaw(followTarget.value);

    if (rawFollowEnabled && rawFollowTarget) {
      const t = rawFollowTarget;
      const targetCenterX = t.x + t.width / 2;
      const targetCenterY = t.y + t.height / 2;
      const desiredX =
        targetCenterX - cameraState.width / (2 * cameraState.zoom);
      const desiredY =
        targetCenterY - cameraState.height / (2 * cameraState.zoom);

      const k = 0.008;
      const alpha = 1 - Math.exp(-k * deltaTime);
      cameraState.x += (desiredX - cameraState.x) * alpha;
      cameraState.y += (desiredY - cameraState.y) * alpha;
    }
  };

  return { update, followTarget, isFollowEnabled };
};

// 방법 6: 움직임 임계값 최적화 (실제 유용한 최적화)
const thresholdOptimizedCamera = () => {
  const cameraState = createCameraState();
  let followTarget = createPlayer();
  let isFollowEnabled = true;
  let lastTargetX = 0;
  let lastTargetY = 0;
  let lastCameraX = 0;
  let lastCameraY = 0;
  const MOVEMENT_THRESHOLD = 0.1;

  const update = (deltaTime = 16.67) => {
    if (!isFollowEnabled || !followTarget) return;

    const t = followTarget;
    const targetCenterX = t.x + t.width / 2;
    const targetCenterY = t.y + t.height / 2;

    // 타겟이 거의 움직이지 않았으면 스킵
    const targetDeltaX = Math.abs(targetCenterX - lastTargetX);
    const targetDeltaY = Math.abs(targetCenterY - lastTargetY);

    if (
      targetDeltaX < MOVEMENT_THRESHOLD &&
      targetDeltaY < MOVEMENT_THRESHOLD
    ) {
      return;
    }

    const desiredX = targetCenterX - cameraState.width / (2 * cameraState.zoom);
    const desiredY =
      targetCenterY - cameraState.height / (2 * cameraState.zoom);

    const k = 0.008;
    const alpha = 1 - Math.exp(-k * deltaTime);
    const newX = cameraState.x + (desiredX - cameraState.x) * alpha;
    const newY = cameraState.y + (desiredY - cameraState.y) * alpha;

    // 카메라가 실제로 움직였는지 확인
    const cameraDeltaX = Math.abs(newX - lastCameraX);
    const cameraDeltaY = Math.abs(newY - lastCameraY);

    if (
      cameraDeltaX > MOVEMENT_THRESHOLD ||
      cameraDeltaY > MOVEMENT_THRESHOLD
    ) {
      cameraState.x = newX;
      cameraState.y = newY;

      lastTargetX = targetCenterX;
      lastTargetY = targetCenterY;
      lastCameraX = cameraState.x;
      lastCameraY = cameraState.y;
    }
  };

  return {
    update,
    followTarget: () => followTarget,
    isFollowEnabled: () => isFollowEnabled,
  };
};

// 퍼포먼스 테스트 함수
const performanceTest = (cameraFactory, name, iterations = 100000) => {
  console.log(`\n=== ${name} 테스트 ===`);

  const camera = cameraFactory();

  // 플레이어 움직임 시뮬레이션
  const simulatePlayerMovement = () => {
    let target;
    if (typeof camera.followTarget === "function") {
      target = camera.followTarget();
    } else if (camera.followTarget?.value) {
      target = camera.followTarget.value;
    } else {
      target = camera.followTarget;
    }

    if (target) {
      target.x += (Math.random() - 0.5) * 2;
      target.y += (Math.random() - 0.5) * 2;
    }
  };

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    if (i % 100 === 0) simulatePlayerMovement(); // 가끔 플레이어 움직임
    camera.update(16.67);
  }

  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  const fps = 1000 / avgTime;

  console.log(`총 시간: ${totalTime.toFixed(2)}ms`);
  console.log(`평균 시간: ${avgTime.toFixed(6)}ms`);
  console.log(`예상 FPS: ${fps.toFixed(0).toLocaleString()}`);

  return { totalTime, avgTime, fps };
};

// 메모리 사용량 테스트
const memoryTest = (cameraFactory, name, iterations = 10000) => {
  console.log(`\n--- ${name} 메모리 테스트 ---`);

  const cameras = [];
  const start = performance.now();

  // 여러 카메라 인스턴스 생성
  for (let i = 0; i < iterations; i++) {
    cameras.push(cameraFactory());
  }

  const end = performance.now();
  console.log(`${iterations}개 인스턴스 생성: ${(end - start).toFixed(2)}ms`);

  // 메모리 해제 시뮬레이션
  cameras.length = 0;
};

// 메인 테스트 실행
const runCameraTests = () => {
  console.log("📹 카메라 최적화 퍼포먼스 테스트");
  console.log("=====================================");

  const testCases = [
    { factory: realVueRefCamera, name: "실제 Vue ref 방식" },
    { factory: realShallowRefCamera, name: "실제 shallowRef 방식" },
    { factory: pureJsCamera, name: "순수 JavaScript 방식" },
    { factory: microOptimizedCamera, name: "미세 최적화 포함" },
    { factory: toRawOptimizedCamera, name: "toRaw 최적화 Vue ref" },
    { factory: thresholdOptimizedCamera, name: "움직임 임계값 최적화" },
  ];

  // 퍼포먼스 테스트
  const results = testCases.map((testCase) => ({
    name: testCase.name,
    ...performanceTest(testCase.factory, testCase.name),
  }));

  // 결과 비교
  console.log("\n📊 성능 비교 결과");
  console.log("=====================================");

  const baseline = results[0]; // ref 기반을 기준으로

  results.forEach((result, index) => {
    if (index === 0) {
      console.log(`${result.name}: 기준 (100%)`);
    } else {
      const improvement =
        ((baseline.avgTime - result.avgTime) / baseline.avgTime) * 100;
      console.log(
        `${result.name}: ${improvement > 0 ? "+" : ""}${improvement.toFixed(1)}% ${improvement > 0 ? "더 빠름" : "더 느림"}`,
      );
    }
  });

  // 메모리 테스트
  console.log("\n🧠 메모리 사용량 테스트");
  console.log("=====================================");

  testCases.forEach((testCase) => {
    memoryTest(testCase.factory, testCase.name);
  });

  // 실제 게임 시나리오 테스트
  console.log("\n🎮 실제 게임 시나리오 (600FPS, 10초간)");
  console.log("=====================================");

  testCases.forEach((testCase) => {
    performanceTest(testCase.factory, `${testCase.name} - 600프레임`, 600);
  });
};

// 테스트 실행 (필요시 주석 해제)
runCameraTests();
