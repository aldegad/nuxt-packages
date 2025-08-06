export const useInput = () => {
  const input = reactive({
    left: false,
    right: false,
  });

  // 키 이벤트 등록
  document.addEventListener("keydown", (e) => {
    if (e.key === "a") input.left = true;
    if (e.key === "d") input.right = true;
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "a") input.left = false;
    if (e.key === "d") input.right = false;
  });

  return { input };
};
