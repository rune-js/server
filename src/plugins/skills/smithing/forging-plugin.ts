import { itemOnObjectAction } from '@server/world/action/item-on-object-action';
import { widgets } from '@server/config';
import { Skill } from '@server/world/actor/skills';
import { bars, smithables, widgetItems } from '@server/plugins/skills/smithing/forging-constants';
import { itemIds } from '@server/world/config/item-ids';
import { cache } from '@server/game-server';
import { Smithable } from '@server/plugins/skills/smithing/forging-types';
import { itemAction } from '@server/world/action/item-action';
import { loopingAction } from '@server/world/action';
import { Player } from '@server/world/actor/player/player';

const mapWidgetItemsToFlatArray = (input) => {
    const result = [];
    smithables.forEach((type) => {
        type.forEach((smithable) => {
            result.push(smithable.item.itemId);
        });
    });
    return result;
};

const mapToFlatArray = (input) => {
    const results = [];
    input.forEach((values) => {
        values.forEach((value) => {
            results.push(value);
        });
    });
    return results;
};

const findSmithableByItemId = (itemId) : Smithable => {
    return mapToFlatArray(smithables).find((smithable) => {
        return smithable.item.itemId === itemId;
    });
};

const smithItem : itemAction = (details) => {
    const { player, option, itemDetails } = details;

    const smithable = findSmithableByItemId(itemDetails.id);


    // In case the smithable doesn't exist.
    if (!smithable) {
        return;
    }

    // Check if the player has the level required.
    if (smithable.level > player.skills.getLevel(Skill.SMITHING)) {
        const item = cache.itemDefinitions.get(smithable.item.itemId);
        player.sendMessage(`You have to be at least level ${smithable.level} to smith ${item.name}s.`, true);
        return;
    }

    const amountInInventory = player.inventory.findAll(smithable.ingredient.itemId).length;

    // Close the forging interface.
    player.interfaceState.closeAllSlots();

    const loop = loopingAction({ player: details.player });
    let elapsedTicks = 0;
    let wantedAmount = 0;
    let forgedAmount = 0;

    // How many? Quick and dirty.
    switch (option) {
        case 'make'     : wantedAmount = 1; break;
        case 'make-5'   : wantedAmount = 5; break;
        case 'make-10'  : wantedAmount = 10; break;
    }

    if (!hasIngredients(details.player, smithable)) {
        player.interfaceState.closeAllSlots();
        const bar = cache.itemDefinitions.get(smithable.ingredient.itemId);
        player.sendMessage(`You don't have enough ${bar.name}s.`, true);
    }

    loop.event.subscribe(() => {
        if (!hasIngredients(details.player, smithable) || wantedAmount === forgedAmount) {
            loop.cancel();
            return;
        }

        if (elapsedTicks % 5 === 0) {
            player.playAnimation(898);

            // Remove ingredients
            for (let i=0; i<smithable.ingredient.amount; i++) {
                player.inventory.removeFirst(smithable.ingredient.itemId);
                details.player.outgoingPackets.sendUpdateAllWidgetItems(widgets.inventory, details.player.inventory);
            }

            // Add item to inventory
            for (let i=0; i<smithable.item.amount; i++) {
                player.inventory.add(smithable.item.itemId);
            }

            // Give the experience
            player.skills.addExp(Skill.SMITHING, smithable.experience);

            forgedAmount++;
        }

        elapsedTicks++;
    });
};

const hasIngredients = (player: Player, smithable: Smithable) => {
    return smithable.ingredient.amount <= player.inventory.findAll(smithable.ingredient.itemId).length;
};

const openForgingInterface : itemOnObjectAction = (details) => {
    const { player, item } = details;
    const amountInInventory = player.inventory.findAll(item).length;

    // The player does not have a hammer.
    if (!player.inventory.has(itemIds.hammer)) {
        player.sendMessage(`You need a hammer to work the metal with.`, true);
        return;
    }

    const barLevel = bars.get(item.itemId);
    const bar = cache.itemDefinitions.get(item.itemId);
    if (barLevel > player.skills.getLevel(Skill.SMITHING)) {
        player.sendMessage(`You have to be at least level ${barLevel} to smith ${bar.name}s.`, true);
        return;
    }

    player.outgoingPackets.updateClientConfig(210, amountInInventory);
    player.outgoingPackets.updateClientConfig(211, player.skills.getLevel(Skill.SMITHING));

    details.player.interfaceState.openWidget(widgets.anvil.widgetId, {
        slot: 'screen'
    });

    widgetItems.get(item.itemId).forEach((items, containerId) => {
        items.forEach((smithable, index) => {
            player.outgoingPackets.sendUpdateSingleWidgetItem({
                widgetId: widgets.anvil.widgetId, containerId: containerId
            }, index, smithable.item);
        });
    });
};

export default [
    {
        type: 'item_on_object',
        itemIds: [...bars.keys()],
        objectIds: [2783],
        options: ['use'],
        action:  openForgingInterface
    },
    {
        type: 'item_action',
        itemIds: [...mapWidgetItemsToFlatArray(widgetItems)],
        action: smithItem
    }
];
