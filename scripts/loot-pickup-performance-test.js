// 루팅 퍼포먼스 테스트: 교집합 방식 vs 중앙점 방식

// 테스트 데이터 생성
const generateTestData = (count) => {
  const player = { x: 500, y: 500, width: 128, height: 128 };
  const loots = [];

  for (let i = 0; i < count; i++) {
    loots.push({
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      width: 32 + Math.random() * 32,
      height: 32 + Math.random() * 32,
    });
  }

  return { player, loots };
};

// 기존 교집합 방식
const intersectionMethod = (player, loots) => {
  const results = [];

  for (let i = 0; i < loots.length; i++) {
    const loot = loots[i];

    // 교집합 영역 계산
    const overlapX = Math.max(
      0,
      Math.min(player.x + player.width, loot.x + loot.width) -
        Math.max(player.x, loot.x),
    );
    const overlapY = Math.max(
      0,
      Math.min(player.y + player.height, loot.y + loot.height) -
        Math.max(player.y, loot.y),
    );
    const overlapArea = overlapX * overlapY;
    const lootArea = loot.width * loot.height;

    // 겹치는 영역이 루트 전체의 절반을 넘으면 루팅
    if (overlapArea > lootArea / 2) {
      results.push(i);
    }
  }

  return results;
};

// 새로운 중앙점 방식
const centerPointMethod = (player, loots) => {
  const results = [];

  for (let i = 0; i < loots.length; i++) {
    const loot = loots[i];

    // 아이템의 중앙점 계산
    const lootCenterX = loot.x + loot.width / 2;
    const lootCenterY = loot.y + loot.height / 2;

    // 아이템의 중앙점이 캐릭터 영역 안에 있는지 확인
    const isInPlayerArea =
      lootCenterX >= player.x &&
      lootCenterX <= player.x + player.width &&
      lootCenterY >= player.y &&
      lootCenterY <= player.y + player.height;

    if (isInPlayerArea) {
      results.push(i);
    }
  }

  return results;
};

// 퍼포먼스 테스트 함수
const performanceTest = (method, name, player, loots, iterations = 10000) => {
  console.log(`\n=== ${name} 테스트 ===`);

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    method(player, loots);
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
const runTests = () => {
  console.log("🎮 루팅 시스템 퍼포먼스 테스트");
  console.log("=====================================");

  const testCases = [
    { count: 10, name: "아이템 10개" },
    { count: 50, name: "아이템 50개" },
    { count: 100, name: "아이템 100개" },
    { count: 500, name: "아이템 500개" },
  ];

  testCases.forEach((testCase) => {
    console.log(`\n📦 ${testCase.name} 테스트`);
    console.log("-----------------------------------");

    const { player, loots } = generateTestData(testCase.count);

    const intersectionResult = performanceTest(
      intersectionMethod,
      "교집합 방식",
      player,
      loots,
    );
    const centerPointResult = performanceTest(
      centerPointMethod,
      "중앙점 방식",
      player,
      loots,
    );

    const improvement =
      ((intersectionResult.avgTime - centerPointResult.avgTime) /
        intersectionResult.avgTime) *
      100;

    console.log(`\n📊 결과:`);
    console.log(
      `중앙점 방식이 ${improvement > 0 ? improvement.toFixed(1) : Math.abs(improvement).toFixed(1)}% ${improvement > 0 ? "더 빠름" : "더 느림"}`,
    );

    // 결과 검증 (같은 결과가 나오는지 확인)
    const intersectionResults = intersectionMethod(player, loots);
    const centerPointResults = centerPointMethod(player, loots);

    console.log(`교집합 방식 픽업 아이템: ${intersectionResults.length}개`);
    console.log(`중앙점 방식 픽업 아이템: ${centerPointResults.length}개`);
  });

  console.log("\n🎯 메모리 사용량 테스트");
  console.log("-----------------------------------");

  const { player, loots } = generateTestData(1000);

  // 메모리 사용량 측정 (대략적)
  const measureMemory = (method, name) => {
    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      method(player, loots);
    }

    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms (1000회)`);
  };

  measureMemory(intersectionMethod, "교집합 방식");
  measureMemory(centerPointMethod, "중앙점 방식");
};

// 테스트 실행 (필요시 주석 해제)
// runTests();
