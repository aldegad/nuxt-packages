export const toLocale = (utcDate: string | undefined) => {
  if (!utcDate) return "";
  const date = new Date(utcDate);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 🌍 [국가별 날짜 포맷 차이]
// - 미국 (en-US): MM/DD/YYYY → 예: 07/28/2025
// - 영국 (en-GB): DD/MM/YYYY → 예: 28/07/2025
// - 독일 (de-DE): DD.MM.YYYY → 예: 28.07.2025
// - 한국 (ko-KR): YYYY. MM. DD. → 예: 2025. 07. 28.
// - 일본 (ja-JP): YYYY/MM/DD → 예: 2025/07/28
// - 중국 (zh-CN): YYYY/M/D → 예: 2025/7/28
// ※ 국가마다 날짜 순서와 구분자(점/슬래시 등)가 다르므로 로케일에 따라 포맷 자동 적용 필요
