import { Player } from './mob/player/player';
import { ChunkManager } from './map/chunk-manager';
import { logger } from '@runejs/logger';
import { ItemDetails, parseItemData } from './config/item-data';
import { gameCache, world } from '@server/game-server';
import { Position } from './position';
import yargs from 'yargs';
import { NpcSpawn, parseNpcSpawns } from './config/npc-spawn';
import { Npc } from './mob/npc/npc';

/**
 * A direction within the world.
 */
export type Direction = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTHEAST' | 'NORTHWEST' | 'SOUTHEAST' | 'SOUTHWEST';

/**
 * Controls the game world and all entities within it.
 */
export class World {

    public static readonly MAX_PLAYERS = 1000;
    public static readonly MAX_NPCS = 30000;
    public static readonly TICK_LENGTH = 600;

    public readonly playerList: Player[] = new Array(World.MAX_PLAYERS);
    public readonly npcList: Npc[] = new Array(World.MAX_NPCS);
    public readonly chunkManager: ChunkManager = new ChunkManager();
    public readonly itemData: Map<number, ItemDetails>;
    public readonly npcSpawns: NpcSpawn[];

    public constructor() {
        this.itemData = parseItemData(gameCache.itemDefinitions);
        this.npcSpawns = parseNpcSpawns();

        for(let i = 0; i < World.MAX_PLAYERS; i++) {
            this.playerList[i] = null;
        }

        for(let i = 0; i < World.MAX_NPCS; i++) {
            this.npcList[i] = null;
        }

        this.setupWorldTick();
    }

    public init(): void {
        this.chunkManager.generateCollisionMaps();
        this.spawnNpcs();
    }

    public spawnNpcs(): void {
        this.npcSpawns.forEach(npcSpawn => {
            const npcDefinition = gameCache.npcDefinitions.get(npcSpawn.npcId);
            const npc = new Npc(npcSpawn, npcDefinition);
            this.registerNpc(npc);
        });
    }

    public setupWorldTick(): void {
        setInterval(async () => await this.worldTick(), World.TICK_LENGTH);
    }

    public generateFakePlayers(): void {
        let x: number = 3222;
        let y: number = 3222;
        let xOffset: number = 0;
        let yOffset: number = 0;

        const spawnChunk = this.chunkManager.getChunkForWorldPosition(new Position(x, y, 0));

        for(let i = 0; i < 990; i++) {
            const player = new Player(null, null, null, i, `test${i}`, 'abs', true);
            this.registerPlayer(player);
            player.activeGameInterface = null;

            xOffset++;

            if(xOffset > 20) {
                xOffset = 0;
                yOffset--;
            }

            player.position = new Position(x + xOffset, y + yOffset, 0);
            const newChunk = this.chunkManager.getChunkForWorldPosition(player.position);

            if(!spawnChunk.equals(newChunk)) {
                spawnChunk.removePlayer(player);
                newChunk.addPlayer(player);
            }

            player.initiateRandomMovement();
        }
    }

    public async worldTick(): Promise<void> {
        let hrTime = process.hrtime();
        const startTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
        const activePlayers: Player[] = this.playerList.filter(player => player !== null);
        const activeNpcs: Npc[] = this.npcList.filter(npc => npc !== null);

        if(activePlayers.length === 0) {
            return Promise.resolve();
        }

        const playerUpdateTasks = activePlayers.map(player => player.playerUpdateTask);
        const npcUpdateTasks = activePlayers.map(player => player.npcUpdateTask);

        await Promise.all([ ...activePlayers.map(player => player.tick()), ...activeNpcs.map(npc => npc.tick()) ]);
        await Promise.all(playerUpdateTasks.map(task => task.execute()));
        await Promise.all(npcUpdateTasks.map(task => task.execute()));
        await Promise.all([ ...activePlayers.map(player => player.reset()), ...activeNpcs.map(npc => npc.reset()) ]);

        return Promise.resolve().then(() => {
            let hrTime = process.hrtime();
            const endTime = hrTime[0] * 1000000 + hrTime[1] / 1000;

            if(yargs.argv.tickTime) {
                logger.info(`World tick completed in ${endTime - startTime} microseconds.`);
            }
        });
    }

    public playerExists(player: Player): boolean {
        const foundPlayer = this.playerList[player.worldIndex];
        if(!foundPlayer) {
            return false;
        }

        return foundPlayer.equals(player);
    }

    public registerPlayer(player: Player): boolean {
        const index = this.playerList.findIndex(p => p === null);

        if(index === -1) {
            logger.warn('World full!');
            return false;
        }

        player.worldIndex = index;
        this.playerList[index] = player;
        player.init();
        return true;
    }

    public deregisterPlayer(player: Player): void {
        this.playerList[player.worldIndex] = null;
    }

    public npcExists(npc: Npc): boolean {
        const foundNpc = this.npcList[npc.worldIndex];
        if(!foundNpc) {
            return false;
        }

        return foundNpc.equals(npc);
    }

    public registerNpc(npc: Npc): boolean {
        const index = this.npcList.findIndex(n => n === null);

        if(index === -1) {
            logger.warn('NPC list full!');
            return false;
        }

        npc.worldIndex = index;
        this.npcList[index] = npc;
        npc.init();
        return true;
    }

    public deregisterNpc(npc: Npc): void {
        this.npcList[npc.worldIndex] = null;
    }

}
