
import { Player } from '@engine/world/actor/player/player';
import { Position } from '@engine/world/position';
import { animationIds } from '@engine/world/config/animation-ids';
import { soundIds } from '@engine/world/config/sound-ids';
import { gfxIds } from '@engine/world/config/gfx-ids';
import { loopingEvent } from '@engine/game-server';
import { TaskExecutor } from '@engine/world/action';
import { widgetButtonIds } from '../skills/smithing/smelting-constants';
import { magiconnpcActionHandler, MagicOnNPCActionHook, MagicOnNPCAction } from '../../game-engine/world/action/magic-on-npc.action';
import { logger } from '@runejs/core';

const buttonIds: number[] = [
    0, // Home Teleport
];

function attack_target(player: Player, elapsedTicks: number): boolean {
    logger.info('attacking?');
    return true;
}

const spells = ['Wind Strike','Confuse', 'Water Strike','unknown?', 'Earth Strike'];
export const activate = (task: TaskExecutor<MagicOnNPCAction>, elapsedTicks: number = 0) => {
    const {
        npc,
        player,
        widgetId,
        buttonId
    } = task.actionData;

    console.info(`${player.username} smites ${npc.name} with ${spells[buttonId]}`);
};

export default {
    pluginId: 'rs:magic',
    hooks: 
        {
            type: 'magic_on_npc',
            widgetId: 192,
            buttonIds: buttonIds,
            task: {
                activate,
                interval: 0
            }
        } as MagicOnNPCActionHook
    
};
