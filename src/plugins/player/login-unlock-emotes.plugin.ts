import { unlockEmotes } from '@plugins/buttons/player-emotes.plugin';
import { playerInitActionHandler } from '@engine/world/action/player-init.action';


export const handler: playerInitActionHandler =
    ({  player  }) => unlockEmotes(player);

export default {
    pluginId: 'rs:unlock_player_emotes',
    hooks: [
        { type: 'player_init', handler }
    ]
};
