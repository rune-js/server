import { actionHookMap } from '@engine/game-server';
import { QuestKey } from '@engine/config/quest-config';
import { ActionType } from '@engine/world/action';


/**
 * Defines a quest requirement for an action hook.
 */
export interface QuestRequirement {
    questId: string;
    stage?: QuestKey;
    stages?: number[];
}


/**
 * Defines a generic extensible game content action hook.
 */
export interface ActionHook<T = any> {
    // The type of action to perform.
    type: ActionType;
    // The action's priority over other actions.
    priority?: number;
    // [optional] Quest requirements that must be completed in order to run this hook.
    questRequirement?: QuestRequirement;
    // The action function to be performed.
    handler: T;
}


/**
 * Fetches the list of all discovered action hooks of the specified type.
 * @param actionType The Action Type to find the hook for.
 * @param filter [optional] Filter criteria to apply to the returned list.
 */
export const getActionHooks = <T extends ActionHook>(actionType: ActionType, filter?: (actionHook: T) => boolean): T[] => {
    const hooks = actionHookMap[actionType] as T[];
    if(!hooks || hooks.length === 0) {
        return [];
    }

    return filter ? hooks.filter(filter) : hooks;
}


/**
 * A sorter function that action hooks can be run through.
 * Action hooks will be sorted by those with quest requirements firstly, and the rest thereafter.
 * @param actionHooks The list of hooks to sort.
 */
export function sortActionHooks<T = any>(actionHooks: ActionHook<T>[]): ActionHook<T>[] {
    return actionHooks.sort(actionHook => actionHook.questRequirement !== undefined ? -1 : 1);
}
