// 전체 게임 시스템 종합 퍼포먼스 테스트

// 시뮬레이션을 위한 게임 상태 생성
const generateGameState = (
  playerCount = 1,
  objectCount = 1000,
  lootCount = 50,
) => {
  const players = [];
  const objects = [];
  const loots = [];

  // 플레이어 생성
  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: i,
      x: Math.random() * 5000,
      y: Math.random() * 5000,
      width: 128,
      height: 128,
      speed: 0.3,
      movingTime: 0,
      sway: 0,
      swayAngle: 0,
    });
  }

  // 환경 오브젝트 생성 (나무, 바위 등)
  for (let i = 0; i < objectCount; i++) {
    objects.push({
      id: i,
      x: Math.random() * 10000,
      y: Math.random() * 10000,
      width: 64 + Math.random() * 128,
      height: 64 + Math.random() * 128,
      type: Math.floor(Math.random() * 3), // tree, rock, etc
    });
  }

  // 루트 아이템 생성
  for (let i = 0; i < lootCount; i++) {
    loots.push({
      id: i,
      x: Math.random() * 10000,
      y: Math.random() * 10000,
      width: 32,
      height: 32,
      type: Math.floor(Math.random() * 5),
    });
  }

  return { players, objects, loots };
};

// 전체 게임 루프 시뮬레이션
const gameLoopSimulation = (gameState, deltaTime = 16.67) => {
  const { players, objects, loots } = gameState;
  const camera = { x: 1000, y: 1000, width: 1920, height: 1080 };

  // 1. 플레이어 업데이트
  players.forEach((player) => {
    // 간단한 이동 시뮬레이션
    player.x += (Math.random() - 0.5) * player.speed * deltaTime;
    player.y += (Math.random() - 0.5) * player.speed * deltaTime;
    player.movingTime += deltaTime;
    player.sway = Math.sin(player.movingTime * 0.01) * 0.1;
    player.swayAngle = player.sway * 0.1;
  });

  // 2. 카메라 업데이트 (첫 번째 플레이어 따라가기)
  if (players.length > 0) {
    camera.x = players[0].x - camera.width / 2;
    camera.y = players[0].y - camera.height / 2;
  }

  // 3. 가시 오브젝트 컬링
  const visibleObjects = objects.filter(
    (obj) =>
      obj.x < camera.x + camera.width &&
      obj.x + obj.width > camera.x &&
      obj.y < camera.y + camera.height &&
      obj.y + obj.height > camera.y,
  );

  // 4. 루팅 검사 (중앙점 방식)
  const pickedUpLoots = [];
  players.forEach((player) => {
    loots.forEach((loot, index) => {
      const lootCenterX = loot.x + loot.width / 2;
      const lootCenterY = loot.y + loot.height / 2;

      const isInPlayerArea =
        lootCenterX >= player.x &&
        lootCenterX <= player.x + player.width &&
        lootCenterY >= player.y &&
        lootCenterY <= player.y + player.height;

      if (isInPlayerArea) {
        pickedUpLoots.push(index);
      }
    });
  });

  // 5. 충돌 검사 (플레이어 vs 환경)
  const collisions = [];
  players.forEach((player) => {
    visibleObjects.forEach((obj) => {
      if (
        player.x < obj.x + obj.width &&
        player.x + player.width > obj.x &&
        player.y < obj.y + obj.height &&
        player.y + player.height > obj.y
      ) {
        collisions.push({ player: player.id, object: obj.id });
      }
    });
  });

  return {
    visibleObjects: visibleObjects.length,
    pickedUpLoots: pickedUpLoots.length,
    collisions: collisions.length,
  };
};

// 최적화된 게임 루프 (청크 기반)
const optimizedGameLoopSimulation = (gameState, deltaTime = 16.67) => {
  const { players, objects, loots } = gameState;
  const camera = { x: 1000, y: 1000, width: 1920, height: 1080 };
  const chunkSize = 512;

  // 1. 플레이어 업데이트 (동일)
  players.forEach((player) => {
    player.x += (Math.random() - 0.5) * player.speed * deltaTime;
    player.y += (Math.random() - 0.5) * player.speed * deltaTime;
    player.movingTime += deltaTime;
    player.sway = Math.sin(player.movingTime * 0.01) * 0.1;
    player.swayAngle = player.sway * 0.1;
  });

  // 2. 카메라 업데이트 (동일)
  if (players.length > 0) {
    camera.x = players[0].x - camera.width / 2;
    camera.y = players[0].y - camera.height / 2;
  }

  // 3. 청크 기반 가시 오브젝트 컬링
  const startChunkX = Math.floor(camera.x / chunkSize);
  const endChunkX = Math.floor((camera.x + camera.width) / chunkSize);
  const startChunkY = Math.floor(camera.y / chunkSize);
  const endChunkY = Math.floor((camera.y + camera.height) / chunkSize);

  const visibleObjects = objects.filter((obj) => {
    const objChunkX = Math.floor(obj.x / chunkSize);
    const objChunkY = Math.floor(obj.y / chunkSize);

    if (
      objChunkX >= startChunkX &&
      objChunkX <= endChunkX &&
      objChunkY >= startChunkY &&
      objChunkY <= endChunkY
    ) {
      return (
        obj.x < camera.x + camera.width &&
        obj.x + obj.width > camera.x &&
        obj.y < camera.y + camera.height &&
        obj.y + obj.height > camera.y
      );
    }
    return false;
  });

  // 4. 루팅 검사 (동일)
  const pickedUpLoots = [];
  players.forEach((player) => {
    loots.forEach((loot, index) => {
      const lootCenterX = loot.x + loot.width / 2;
      const lootCenterY = loot.y + loot.height / 2;

      const isInPlayerArea =
        lootCenterX >= player.x &&
        lootCenterX <= player.x + player.width &&
        lootCenterY >= player.y &&
        lootCenterY <= player.y + player.height;

      if (isInPlayerArea) {
        pickedUpLoots.push(index);
      }
    });
  });

  // 5. 충돌 검사 (가시 오브젝트만)
  const collisions = [];
  players.forEach((player) => {
    visibleObjects.forEach((obj) => {
      if (
        player.x < obj.x + obj.width &&
        player.x + player.width > obj.x &&
        player.y < obj.y + obj.height &&
        player.y + player.height > obj.y
      ) {
        collisions.push({ player: player.id, object: obj.id });
      }
    });
  });

  return {
    visibleObjects: visibleObjects.length,
    pickedUpLoots: pickedUpLoots.length,
    collisions: collisions.length,
  };
};

// 퍼포먼스 테스트 함수
const performanceTest = (method, name, gameState, iterations = 100) => {
  console.log(`\n=== ${name} 테스트 ===`);

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    method(gameState);
  }

  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  const fps = 1000 / avgTime;

  console.log(`총 시간: ${totalTime.toFixed(2)}ms`);
  console.log(`평균 시간: ${avgTime.toFixed(4)}ms`);
  console.log(`예상 FPS: ${fps.toFixed(1)}`);
  console.log(`60FPS 달성: ${fps >= 60 ? "✅" : "❌"}`);

  return { totalTime, avgTime, fps };
};

// 메인 테스트
const runCompleteTests = () => {
  console.log("🎮 전체 게임 시스템 퍼포먼스 테스트");
  console.log("=====================================");

  const testCases = [
    { objects: 500, loots: 20, name: "가벼운 환경" },
    { objects: 1000, loots: 50, name: "보통 환경" },
    { objects: 2000, loots: 100, name: "무거운 환경" },
    { objects: 5000, loots: 200, name: "극한 환경" },
  ];

  testCases.forEach((testCase) => {
    console.log(`\n📦 ${testCase.name} 테스트`);
    console.log(`오브젝트: ${testCase.objects}개, 루트: ${testCase.loots}개`);
    console.log("-----------------------------------");

    const gameState = generateGameState(1, testCase.objects, testCase.loots);

    const basicResult = performanceTest(
      gameLoopSimulation,
      "기본 게임 루프",
      gameState,
    );
    const optimizedResult = performanceTest(
      optimizedGameLoopSimulation,
      "최적화된 게임 루프",
      gameState,
    );

    const improvement =
      ((basicResult.avgTime - optimizedResult.avgTime) / basicResult.avgTime) *
      100;

    console.log(`\n📊 결과:`);
    console.log(
      `최적화로 ${improvement > 0 ? improvement.toFixed(1) : Math.abs(improvement).toFixed(1)}% ${improvement > 0 ? "향상" : "저하"}`,
    );
    console.log(
      `FPS 향상: ${basicResult.fps.toFixed(1)} → ${optimizedResult.fps.toFixed(1)}`,
    );
  });
};

// 테스트 실행 (필요시 주석 해제)
// runCompleteTests();
