import { Command, type Player } from "@aldegad/nuxt-forest-princess/schemas";
import type { CommandState } from "@aldegad/nuxt-core";

export type PlayerMovementProps = {
  ctx: CanvasRenderingContext2D;
  player: Ref<Player>;
  command: CommandState;
  deltaTime: number;
};

export const playerMovement = ({ ctx, player, command, deltaTime }: PlayerMovementProps) => {
  ctx.save();
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
    player.value.x += (dx / len) * player.value.speed * deltaTime;
    player.value.y += (dy / len) * player.value.speed * deltaTime;
    player.value.movingTime += deltaTime;
  } else {
    player.value.movingTime = 0;
  }

  const angle = Math.sin(player.value.movingTime * 0.01) * 0.1;
  ctx.translate(player.value.x + player.value.width / 2, player.value.y + player.value.height / 2);
  ctx.rotate(angle);
  if (player.value.src) {
    ctx.drawImage(
      player.value.src,
      -player.value.width / 2,
      -player.value.height / 2,
      player.value.width,
      player.value.height,
    );
  }
  ctx.restore();
};
