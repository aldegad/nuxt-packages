export const toLocale = (number: number | undefined) => {
  if (!number) return "";
  return number.toLocaleString();
};

// 🌍 [국가별 숫자 포맷 차이]
// - 미국/한국/일본/중국: 천 단위 쉼표(,) + 소수점 점(.) → 예: 1,234,567.89
// - 독일 (de-DE): 천 단위 점(.) + 소수점 쉼표(,) → 예: 1.234.567,89
// - 프랑스 (fr-FR): 천 단위 공백 + 소수점 쉼표(,) → 예: 1 234 567,89
// ※ 천 단위 구분자와 소수점 기호가 다름. 직접 포맷하지 말고 toLocaleString 사용 권장
