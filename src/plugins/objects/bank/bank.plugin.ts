import { objectIds } from '@engine/world/config/object-ids';
import { widgetScripts } from '@engine/world/config/widget';
import { objectInteractionActionHandler } from '@engine/world/action/object-interaction.action';
import { ItemContainer } from '@engine/world/items/item-container';
import { itemInteractionActionHandler } from '@engine/world/action/item-interaction.action';
import { fromNote, Item, toNote } from '@engine/world/items/item';
import { buttonActionHandler } from '@engine/world/action/button.action';
import { dialogue, Emote, execute } from '@engine/world/actor/dialogue';
import { widgets } from '@engine/config';


const buttonIds: number[] = [
    92, // as note
    93, // as item
    98, // swap
    99, // insert
];

export const openBankInterface: objectInteractionActionHandler = ({ player }) => {
    player.interfaceState.openWidget(widgets.bank.screenWidget.widgetId, {
        slot: 'screen',
        multi: true
    });
    player.interfaceState.openWidget(widgets.bank.tabWidget.widgetId, {
        slot: 'tabarea',
        multi: true
    });

    player.outgoingPackets.sendUpdateAllWidgetItems(widgets.bank.tabWidget, player.inventory);
    player.outgoingPackets.sendUpdateAllWidgetItems(widgets.bank.screenWidget, player.bank);
    player.outgoingPackets.updateClientConfig(widgetScripts.bankInsertMode, player.settings.bankInsertMode);
    player.outgoingPackets.updateClientConfig(widgetScripts.bankWithdrawNoteMode, player.settings.bankWithdrawNoteMode);
};

export const openPinSettings: objectInteractionActionHandler = ({ player }) => {
    player.interfaceState.openWidget(widgets.bank.pinSettingsWidget.widgetId, {
        slot: 'screen'
    });
};

export const depositItem: itemInteractionActionHandler = (details) => {
    // Check if player might be spawning widget clientside
    if (!details.player.interfaceState.findWidget(widgets.bank.screenWidget.widgetId)) {
        return;
    }

    // Check if the player has the item

    if (!details.player.hasItemInInventory(details.itemId)) {
        return;
    }


    let itemIdToAdd: number = details.itemId;
    const fromNoteId: number = fromNote(details.itemId);
    if (fromNoteId > -1) {
        itemIdToAdd = fromNoteId;
    }

    let countToRemove: number;
    if (details.option.endsWith('all')) {
        countToRemove = -1;
    } else {
        countToRemove = +details.option.replace('deposit-', '');
    }


    const playerInventory: ItemContainer = details.player.inventory;
    const playerBank: ItemContainer = details.player.bank;
    const slotsWithItem: number[] = playerInventory.findAll(details.itemId);
    let itemAmount: number = 0;
    slotsWithItem.forEach((slot) => itemAmount += playerInventory.items[slot].amount);
    if (countToRemove == -1 || countToRemove > itemAmount) {
        countToRemove = itemAmount;
    }

    if (!playerBank.canFit({ itemId: itemIdToAdd, amount: countToRemove }, true)) {
        details.player.sendMessage('Your bank is full.');
        return;
    }


    const itemToAdd: Item = { itemId: itemIdToAdd, amount: 0 };
    while (countToRemove > 0 && playerInventory.has(details.itemId)) {
        const invIndex = playerInventory.findIndex(details.itemId);
        const invItem = playerInventory.items[invIndex];
        if (countToRemove >= invItem.amount) {
            itemToAdd.amount += invItem.amount;
            countToRemove -= invItem.amount;
            playerInventory.remove(invIndex);
        } else {
            itemToAdd.amount += countToRemove;
            invItem.amount -= countToRemove;
            countToRemove = 0;
        }
    }

    playerBank.addStacking(itemToAdd);


    details.player.outgoingPackets.sendUpdateAllWidgetItems(widgets.bank.tabWidget, details.player.inventory);
    details.player.outgoingPackets.sendUpdateAllWidgetItems(widgets.inventory, details.player.inventory);
    details.player.outgoingPackets.sendUpdateAllWidgetItems(widgets.bank.screenWidget, details.player.bank);
};


export const withdrawItem: itemInteractionActionHandler = (details) => {
    // Check if player might be spawning widget clientside
    if (!details.player.interfaceState.findWidget(widgets.bank.screenWidget.widgetId)) {
        return;
    }
    // Check if the player has the item
    if (!details.player.hasItemInBank(details.itemId)) {
        return;
    }

    let itemIdToAdd: number = details.itemId;
    if (details.player.settings.bankWithdrawNoteMode) {
        const toNoteId: number = toNote(details.itemId);
        if (toNoteId > -1) {
            itemIdToAdd = toNoteId;
        } else {
            details.player.sendMessage('This item can not be withdrawn as a note.');
        }
    }


    let countToRemove: number;
    if (details.option.endsWith('all')) {
        countToRemove = -1;
    } else {
        countToRemove = +details.option.replace('withdraw-', '');
    }

    const playerBank: ItemContainer = details.player.bank;
    const playerInventory: ItemContainer = details.player.inventory;
    const slotWithItem: number = playerBank.findIndex(details.itemId);
    const itemAmount: number = playerBank.items[slotWithItem].amount;
    if (countToRemove == -1 || countToRemove > itemAmount) {
        countToRemove = itemAmount;
    }

    if (!details.itemDetails.stackable) {
        const slots = playerInventory.getOpenSlotCount();
        if (slots < countToRemove) {
            countToRemove = slots;
        }
    }
    if (!playerInventory.canFit({ itemId: itemIdToAdd, amount: countToRemove }) || countToRemove === 0) {
        details.player.sendMessage('Your inventory is full.');
        return;
    }


    const itemToAdd: Item = { itemId: itemIdToAdd, amount: 0 };
    while (countToRemove > 0 && playerBank.has(details.itemId)) {
        const invIndex = playerBank.findIndex(details.itemId);
        const invItem = playerBank.items[invIndex];
        if (countToRemove >= invItem.amount) {
            itemToAdd.amount += invItem.amount;
            countToRemove -= invItem.amount;
            playerBank.remove(invIndex);
        } else {
            itemToAdd.amount += countToRemove;
            invItem.amount -= countToRemove;
            countToRemove = 0;
        }
    }
    for (let i = 0; i < itemToAdd.amount; i++) {
        playerInventory.add({ itemId: itemIdToAdd, amount: 1 });
    }


    details.player.outgoingPackets.sendUpdateAllWidgetItems(widgets.bank.tabWidget, details.player.inventory);
    details.player.outgoingPackets.sendUpdateAllWidgetItems(widgets.inventory, details.player.inventory);
    details.player.outgoingPackets.sendUpdateAllWidgetItems(widgets.bank.screenWidget, details.player.bank);
};

export const btnAction: buttonActionHandler = (details) => {
    const { player, buttonId } = details;
    player.settingChanged(buttonId);

    const settingsMappings = {
        92: { setting: 'bankWithdrawNoteMode', value: 1 },
        93: { setting: 'bankWithdrawNoteMode', value: 0 },
        98: { setting: 'bankInsertMode', value: 0 },
        99: { setting: 'bankInsertMode', value: 1 },
    };
    if (!settingsMappings[buttonId]) {
        return;
    }

    const config = settingsMappings[buttonId];
    player.settings[config.setting] = config.value;
};

const useBankBoothAction : objectInteractionActionHandler = (details) => {
    const { player } = details;

    dialogue([player, { npc: 'rs:generic_banker', key: 'banker' }], [
        banker => [Emote.HAPPY, `Good day, how can I help you?`],
        options => [
            `I'd Like to access my bank account, please.`, [
                execute(() => {
                    openBankInterface(details as any);
                })
            ],
            `I'd like to check my PIN settings.`, [
                execute(() => {
                    openPinSettings(details);
                })
            ],
            `What is this place?`, [
                player => [Emote.WONDERING, `What is this place?`],
                banker => [Emote.HAPPY, `This is a branch of the Bank of Gielinor. We have branches in many towns.`],
                player => [Emote.WONDERING, `And what do you do?`],
                banker => [Emote.GENERIC, `We will look after your items and money for you.`],
                banker => [Emote.GENERIC, `Leave your valuables with us if you want to keep them safe.`]
            ]
        ]
    ]);
};

export default {
    pluginId: 'rs:banking',
    hooks: [
        {
            type: 'object_interaction',
            objectIds: objectIds.bankBooth,
            options: [ 'use' ],
            walkTo: true,
            handler: useBankBoothAction
        }, {
            type: 'object_interaction',
            objectIds: objectIds.bankBooth,
            options: [ 'use-quickly' ],
            walkTo: true,
            handler: openBankInterface
        }, {
            type: 'item_interaction',
            widgets: widgets.bank.tabWidget,
            options: [ 'deposit-1', 'deposit-5', 'deposit-10', 'deposit-all' ],
            handler: depositItem,
        }, {
            type: 'item_interaction',
            widgets: widgets.bank.screenWidget,
            options: [ 'withdraw-1', 'withdraw-5', 'withdraw-10', 'withdraw-all' ],
            handler: withdrawItem,
        }, {
            type: 'button',
            widgetId: widgets.bank.screenWidget.widgetId,
            buttonIds: buttonIds,
            handler: btnAction
        }
    ]
};
