import { Chunk } from './chunk';
import { Position } from '../position';
import { logger } from '@runejs/core';
import { filestore } from '@engine/game-server';
import { LandscapeFile, LandscapeObject, MapFile } from '@runejs/filestore';


export class Tile {

    public settings: number;
    public nonWalkable: boolean;
    public bridge: boolean;

    public constructor(public x: number, public y: number, public level: number, settings?: number) {
        if(settings !== undefined) {
            this.setSettings(settings);
        }
    }

    public setSettings(settings: number): void {
        this.settings = settings;
        this.nonWalkable = (this.settings & 0x1) == 0x1;
        this.bridge = (this.settings & 0x2) == 0x2;
    }

}

export interface MapRegion {
    tiles: Tile[];
    objects: LandscapeObject[];
}


/**
 * Controls all of the game world's map chunks.
 */
export class ChunkManager {

    public readonly regionMap: Map<string, MapRegion> = new Map<string, MapRegion>();
    public readonly tileMap: Map<string, Tile> = new Map<string, Tile>();
    private readonly chunkMap: Map<string, Chunk>;

    public constructor() {
        this.chunkMap = new Map<string, Chunk>();
    }

    public registerMapRegion(mapRegionX: number, mapRegionY: number): void {
        const key = `${mapRegionX},${mapRegionY}`;

        if(this.regionMap.has(key)) {
            // Map region already registered
            return;
        }

        let mapFile: MapFile;
        let landscapeFile: LandscapeFile;

        try {
            mapFile = filestore.regionStore.getMapFile(mapRegionX, mapRegionY);
        } catch(error) {
            logger.error(`Error decoding map file ${mapRegionX},${mapRegionY}`);
        }
        try {
            landscapeFile = filestore.regionStore.getLandscapeFile(mapRegionX, mapRegionY);
        } catch(error) {
            logger.error(`Error decoding landscape file ${mapRegionX},${mapRegionY}`);
        }

        const region: MapRegion = { tiles: [],
            objects: landscapeFile?.landscapeObjects || [] };

        // Parse map tiles for game engine use
        for(let level = 0; level < 4; level++) {
            for(let x = 0; x < 64; x++) {
                for(let y = 0; y < 64; y++) {
                    const tileSettings = mapFile?.tileSettings[level][x][y] || 0;
                    region.tiles.push(new Tile(x, y, level, tileSettings));
                }
            }
        }

        this.regionMap.set(key, region);
        this.registerTiles(region.tiles);

        const worldX = (mapRegionX & 0xff) * 64;
        const worldY = mapRegionY * 64;
        this.registerObjects(region.objects, worldX, worldY);
    }

    public registerTiles(tiles: Tile[]): void {
        if(!tiles || tiles.length === 0) {
            return;
        }

        for(const tile of tiles) {
            const key = `${tile.x},${tile.y},${tile.level}`;

            if(tile.bridge) {
                // Move this tile down one level if it's a bridge tile
                const newTile = new Tile(tile.x, tile.y, tile.level - 1, 0);
                this.tileMap.set(`${newTile.x},${newTile.y},${newTile.level}`, newTile);

                // And also add the bridge tile itself, so that game objects know about it
                this.tileMap.set(key, tile);
            } else if(tile.nonWalkable) { // No need to know about walkable tiles for collision maps, only nonwalkable
                if(!this.tileMap.has(key)) {
                    // Otherwise add a new tile if it hasn't already been set (IE by a bridge tile above)
                    this.tileMap.set(key, tile);
                }
            }
        }
    }

    public registerObjects(objects: LandscapeObject[], mapRegionStartX: number, mapRegionStartY: number): void {
        if(!objects || objects.length === 0) {
            return;
        }

        for(const object of objects) {
            const position = new Position(object.x, object.y, object.level);

            const tile = this.tileMap.get(position.key);
            if(tile?.bridge) {
                // Object is on a bridge tile, move it down a level to create proper collision maps
                position.level -= 1;
            }

            const tileAbove = this.tileMap.get(`${object.x},${object.y},${object.level + 1}`);
            if(tileAbove?.bridge) {
                // Object is below a bridge tile, move it down a level to create proper collision maps
                position.level -= 1;
            }

            this.getChunkForWorldPosition(position).setFilestoreLandscapeObject(object);
        }
    }

    public getSurroundingChunks(chunk: Chunk): Chunk[] {
        const chunks: Chunk[] = [];

        const mainX = chunk.position.x;
        const mainY = chunk.position.y;
        const level = chunk.position.level;

        for(let x = mainX - 2; x <= mainX + 2; x++) {
            for(let y = mainY - 2; y <= mainY + 2; y++) {
                chunks.push(this.getChunk({ x, y, level }));
            }
        }

        return chunks;
    }

    /**
     * Given a world Position, return the region ID that it is contained within.
     * @param position The position to use
     */
    public getRegionIdForWorldPosition(position: Position): number {
        return ((position.x >> 6) << 8) + (position.y >> 6);
    }

    public getChunkForWorldPosition(position: Position): Chunk {
        return this.getChunk({ x: position.chunkX, y: position.chunkY, level: position.level });
    }

    public getChunk(position: Position | { x: number, y: number, level: number }): Chunk {
        if(!(position instanceof Position)) {
            position = new Position(position.x, position.y, position.level);
        }

        const pos = (position as Position);

        if(this.chunkMap.has(pos.key)) {
            return this.chunkMap.get(pos.key);
        } else {
            const chunk = new Chunk(pos);
            this.chunkMap.set(pos.key, chunk);
            return chunk;
        }
    }

}
