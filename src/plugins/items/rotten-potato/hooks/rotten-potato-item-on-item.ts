import { itemOnItemActionHandler } from '@engine/world/action/item-on-item.action';
import { RottenPotatoItem } from '@plugins/items/rotten-potato/helpers/rotten-potato-helpers';
import { findItem } from '@engine/config';

const itemOnPotato: itemOnItemActionHandler = (details) => {
    const slotToDelete = details.usedItem.itemId === RottenPotatoItem.gameId ? details.usedWithSlot : details.usedSlot;
    const item = details.player.inventory.items[slotToDelete].itemId;
    const itemDetails = findItem(item);
    details.player.removeItem(slotToDelete);
    details.player.sendLogMessage(`Whee... ${itemDetails.name} All gone!`, false)
};

export default itemOnPotato;
