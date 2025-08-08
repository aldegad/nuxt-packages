import { Command, type PlayerMovementProps, type RenderPlayerProps } from "@aldegad/nuxt-forest-princess/schemas";

export const updatePlayerMovement = ({ player, command, deltaTime }: PlayerMovementProps) => {
  let dx = 0;
  let dy = 0;
  if (command.state.includes(Command.MOVE_UP)) {
    dy -= 1;
  }
  if (command.state.includes(Command.MOVE_RIGHT)) {
    dx += 1;
  }
  if (command.state.includes(Command.MOVE_DOWN)) {
    dy += 1;
  }
  if (command.state.includes(Command.MOVE_LEFT)) {
    dx -= 1;
  }

  if (dx !== 0 || dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    player.x += (dx / len) * player.speed * deltaTime;
    player.y += (dy / len) * player.speed * deltaTime;
    player.movingTime += deltaTime;
    player.sway = (player.movingTime * 0.01) % (Math.PI * 2);
  } else {
    player.movingTime = 0;
    const step = deltaTime * 0.01;
    if (player.sway > Math.PI) {
      player.sway = Math.max(player.sway - step, 0);
    } else if (player.sway > 0 && player.sway < Math.PI) {
      player.sway = Math.min(player.sway + step, Math.PI);
    } else {
      player.sway = 0;
    }
  }

  // 렌더 단계에서 삼각함수 계산을 없애기 위해 각도를 업데이트 단계에서 미리 계산
  player.swayAngle = Math.sin(player.sway) * 0.08;
};
