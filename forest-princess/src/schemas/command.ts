export enum Command {
  MOVE_UP = "move-up",
  MOVE_RIGHT = "move-right",
  MOVE_DOWN = "move-down",
  MOVE_LEFT = "move-left",
}

export const commandMap = {
  [Command.MOVE_UP]: [["ArrowUp"], ["w"]],
  [Command.MOVE_RIGHT]: [["ArrowRight"], ["d"]],
  [Command.MOVE_DOWN]: [["ArrowDown"], ["s"]],
  [Command.MOVE_LEFT]: [["ArrowLeft"], ["a"]],
};
