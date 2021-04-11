import { logger } from '@runejs/core';
import { world } from '../../game-server';
import { World } from '../../world';
import { widgets } from '../../config';
import { Player } from '@engine/world/actor/player/player';
import { PacketData } from '@engine/net/inbound-packets';

const itemOnPlayerPacket = (player: Player, packet: PacketData) => {
    const { buffer } = packet;
    const playerIndex = buffer.get('SHORT', 'UNSIGNED', 'LITTLE_ENDIAN') - 1;
    const itemWidgetId = buffer.get('SHORT', 'SIGNED', 'LITTLE_ENDIAN');
    const itemContainerId = buffer.get('SHORT');
    const itemId = buffer.get('SHORT', 'UNSIGNED', 'BIG_ENDIAN');
    const itemSlot = buffer.get('SHORT', 'UNSIGNED', 'BIG_ENDIAN');


    let usedItem;
    if(itemWidgetId === widgets.inventory.widgetId && itemContainerId === widgets.inventory.containerId) {
        if(itemSlot < 0 || itemSlot > 27) {
            return;
        }

        usedItem = player.inventory.items[itemSlot];
        if(!usedItem) {
            return;
        }

        if(usedItem.itemId !== itemId) {
            return;
        }
    } else {
        logger.warn(`Unhandled item on object case using widget ${ itemWidgetId }:${ itemContainerId }`);
    }


    if(playerIndex < 0 || playerIndex > World.MAX_PLAYERS - 1) {
        return;
    }

    const otherPlayer = world.playerList[playerIndex];
    if(!otherPlayer) {
        return;
    }


    const position = otherPlayer.position;
    const distance = Math.floor(position.distanceBetween(player.position));



    // Too far away
    if(distance > 16) {
        return;
    }


    player.actionPipeline.call('item_on_player', player, otherPlayer, position, usedItem, itemWidgetId, itemContainerId)
};

export default {
    opcode: 110,
    size: 10,
    handler: itemOnPlayerPacket
};
