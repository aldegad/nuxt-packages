// 청크 기반 렌더링 퍼포먼스 테스트

// 테스트용 오브젝트 생성
const generateObjects = (count) => {
  const objects = [];

  for (let i = 0; i < count; i++) {
    objects.push({
      id: i,
      x: Math.random() * 10000,
      y: Math.random() * 10000,
      width: 32 + Math.random() * 64,
      height: 32 + Math.random() * 64,
      type: Math.floor(Math.random() * 5), // 5가지 타입
    });
  }

  return objects;
};

// 전체 렌더링 방식 (기존)
const fullRenderMethod = (objects, camera) => {
  const visibleObjects = [];

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];

    // 카메라 영역과 교집합 확인
    if (
      obj.x < camera.x + camera.width &&
      obj.x + obj.width > camera.x &&
      obj.y < camera.y + camera.height &&
      obj.y + obj.height > camera.y
    ) {
      visibleObjects.push(obj);
    }
  }

  return visibleObjects;
};

// 청크 기반 렌더링 방식
const chunkRenderMethod = (objects, camera, chunkSize = 512) => {
  // 청크 맵 생성 (한 번만 실행, 여기서는 매번 생성으로 시뮬레이션)
  const chunkMap = new Map();

  // 오브젝트를 청크에 할당
  objects.forEach((obj) => {
    const chunkX = Math.floor(obj.x / chunkSize);
    const chunkY = Math.floor(obj.y / chunkSize);
    const chunkKey = `${chunkX},${chunkY}`;

    if (!chunkMap.has(chunkKey)) {
      chunkMap.set(chunkKey, []);
    }
    chunkMap.get(chunkKey).push(obj);
  });

  // 카메라가 보는 청크들만 확인
  const visibleObjects = [];
  const startChunkX = Math.floor(camera.x / chunkSize);
  const endChunkX = Math.floor((camera.x + camera.width) / chunkSize);
  const startChunkY = Math.floor(camera.y / chunkSize);
  const endChunkY = Math.floor((camera.y + camera.height) / chunkSize);

  for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
      const chunkKey = `${chunkX},${chunkY}`;
      const chunkObjects = chunkMap.get(chunkKey) || [];

      // 해당 청크의 오브젝트들 중 실제로 보이는 것들만 필터링
      chunkObjects.forEach((obj) => {
        if (
          obj.x < camera.x + camera.width &&
          obj.x + obj.width > camera.x &&
          obj.y < camera.y + camera.height &&
          obj.y + obj.height > camera.y
        ) {
          visibleObjects.push(obj);
        }
      });
    }
  }

  return visibleObjects;
};

// 퍼포먼스 테스트 함수
const performanceTest = (method, name, objects, camera, iterations = 1000) => {
  console.log(`\n=== ${name} 테스트 ===`);

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    method(objects, camera);
  }

  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / iterations;

  console.log(`총 시간: ${totalTime.toFixed(2)}ms`);
  console.log(`평균 시간: ${avgTime.toFixed(4)}ms`);
  console.log(
    `초당 처리 가능 횟수: ${Math.round(1000 / avgTime).toLocaleString()}회`,
  );

  return { totalTime, avgTime };
};

// 메인 테스트
const runChunkTests = () => {
  console.log("🎮 청크 기반 렌더링 퍼포먼스 테스트");
  console.log("=====================================");

  const camera = { x: 1000, y: 1000, width: 1920, height: 1080 };

  const testCases = [
    { count: 100, name: "오브젝트 100개" },
    { count: 500, name: "오브젝트 500개" },
    { count: 1000, name: "오브젝트 1,000개" },
    { count: 5000, name: "오브젝트 5,000개" },
    { count: 10000, name: "오브젝트 10,000개" },
  ];

  testCases.forEach((testCase) => {
    console.log(`\n📦 ${testCase.name} 테스트`);
    console.log("-----------------------------------");

    const objects = generateObjects(testCase.count);

    const fullRenderResult = performanceTest(
      fullRenderMethod,
      "전체 렌더링",
      objects,
      camera,
    );
    const chunkRenderResult = performanceTest(
      chunkRenderMethod,
      "청크 렌더링",
      objects,
      camera,
    );

    const improvement =
      ((fullRenderResult.avgTime - chunkRenderResult.avgTime) /
        fullRenderResult.avgTime) *
      100;

    console.log(`\n📊 결과:`);
    console.log(
      `청크 방식이 ${improvement > 0 ? improvement.toFixed(1) : Math.abs(improvement).toFixed(1)}% ${improvement > 0 ? "더 빠름" : "더 느림"}`,
    );

    // 결과 검증
    const fullResults = fullRenderMethod(objects, camera);
    const chunkResults = chunkRenderMethod(objects, camera);

    console.log(`전체 렌더링 가시 오브젝트: ${fullResults.length}개`);
    console.log(`청크 렌더링 가시 오브젝트: ${chunkResults.length}개`);
  });
};

// 테스트 실행 (필요시 주석 해제)
// runChunkTests();
