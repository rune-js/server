import { RsBuffer } from '@server/net/rs-buffer';
import { Player } from '../player';

export type incomingPacket = (player: Player, packetId: number, packetSize: number, buffer: RsBuffer) => void;
