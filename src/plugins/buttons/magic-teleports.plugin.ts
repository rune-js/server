import { buttonActionHandler } from '@engine/world/action/button.action';
import { Player } from '@engine/world/actor/player/player';
import { Position } from '@engine/world/position';
import { animationIds } from '@engine/world/config/animation-ids';
import { soundIds } from '@engine/world/config/sound-ids';
import { gfxIds } from '@engine/world/config/gfx-ids';
import { loopingEvent } from '@engine/game-server';

enum Teleports {
    Home = 591,
    Varrock = 12,
    Lumbridge = 15,
    Falador = 18,
    Camelot = 22,
    Ardougne = 388,
    Watchtower = 389,
    Trollheim = 492,
    Ape_atoll = 569
}

const buttonIds: number[] = [
    591, // Home Teleport
];

function homeTeleport(player: Player): void {
    let elapsedTicks = 0;

    const loop = loopingEvent({ player });
    loop.event.subscribe(() => {
        if (elapsedTicks === 0) {
            player.playAnimation(animationIds.homeTeleportDraw);
            player.playGraphics({ id: gfxIds.homeTeleportDraw, delay: 0, height: 0 });
            player.outgoingPackets.playSound(soundIds.homeTeleportDraw, 10);
        }
        if (elapsedTicks === 7) {
            player.playAnimation(animationIds.homeTeleportSit);
            player.playGraphics({ id: gfxIds.homeTeleportFullDrawnCircle, delay: 0, height: 0 });
            player.outgoingPackets.playSound(soundIds.homeTeleportSit, 10);
        }
        if (elapsedTicks === 12) {
            player.playAnimation(animationIds.homeTeleportPullOutAndReadBook);
            player.playGraphics({ id: gfxIds.homeTeleportPullOutBook, delay: 0, height: 0 });
            player.outgoingPackets.playSound(soundIds.homeTeleportPullOutBook, 10);
        }
        if (elapsedTicks === 16) {
            player.playAnimation(animationIds.homeTeleportReadBookAndGlowCircle);
            player.playGraphics({ id: gfxIds.homeTeleportCircleGlow, delay: 0, height: 0 });
            player.outgoingPackets.playSound(soundIds.homeTeleportCircleGlowAndTeleport, 10);
        }
        if (elapsedTicks === 20) {
            player.playAnimation(animationIds.homeTeleport);
            player.playGraphics({ id: gfxIds.homeTeleport, delay: 0, height: 0 });
        }
        if (elapsedTicks === 22) {
            player.teleport(new Position(3218, 3218));
            loop.cancel();
            return;
        }
        elapsedTicks++;
    });
}

export const handler: buttonActionHandler = (details) => {
    const { player, buttonId } = details;

    switch (buttonId) {
        case Teleports.Home:
            homeTeleport(player);
            break;
    }
};

export default {
    pluginId: 'rs:magic_teleports',
    hooks: [
        { type: 'button', widgetId: 192, buttonIds: buttonIds, handler }
    ]
};
