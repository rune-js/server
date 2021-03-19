import { npcInteractionActionHandler } from '@engine/world/action/npc-interaction.action';
import { findShop } from '@engine/config';


const tradeAction: npcInteractionActionHandler = ({ player }) =>
    findShop('rs:louies_armored_legs')?.open(player);

export default {
    pluginId: 'rs:louie_armored_legs',
    hooks: [ {
        type: 'npc_interaction',
        npcs: 'rs:alkharid_louie',
        options: 'trade',
        walkTo: true,
        handler: tradeAction
    }]
};
