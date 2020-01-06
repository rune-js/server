import { logger } from '@runejs/logger/dist/logger';
import { JSON_SCHEMA, safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { serverDir } from '@server/game-server';
import { Direction } from '@server/world/world';

export interface NpcSpawn {
    npcId: number;
    x: number;
    y: number;
    level?: number;
    radius?: number;
    face?: Direction;
}

export function parseNpcSpawns(): NpcSpawn[] {
    try {
        logger.info('Parsing npc spawns...');

        const npcSpawns = safeLoad(readFileSync(join(serverDir, 'data/config/npc-spawns.yaml'), 'utf8'), { schema: JSON_SCHEMA }) as NpcSpawn[];

        if(!npcSpawns || npcSpawns.length === 0) {
            throw 'Unable to read npc spawns.';
        }

        logger.info(`${npcSpawns.length} npc spawns found.`);

        return npcSpawns;
    } catch(error) {
        logger.error('Error parsing npc spawns: ' + error);
        return null;
    }
}
