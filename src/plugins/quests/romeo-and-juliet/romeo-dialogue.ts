import { randomBetween } from '@engine/util/num';
import { dialogue, Emote, execute, goto } from '@engine/world/actor/dialogue';
import { Position } from '@engine/world/position';
import { WorldInstance } from '@engine/world/instances';
import uuidv4 from 'uuid/v4';
import { QuestDialogueHandler } from '@engine/config/quest-config';
import { Player } from '@engine/world/actor/player/player';
import { Npc } from '@engine/world/actor/npc/npc';
import { Cutscene } from '@engine/world/actor/player/cutscenes';
import { world } from '@engine/game-server';
import { schedule } from '@engine/world/task';
import { questItems, questKey } from './romeo-and-juliet-quest.plugin';

const findingFatherLawrence = () => {
    return (options, tag_FATHER_LAWRENCE) => [
        `How are you?`, [
            player => [Emote.POMPOUS, `How are you?`],
            romeo => [Emote.SAD, `Not so good my friend...I miss Judi..., Junie..., Joopie...`],
            player => [Emote.POMPOUS, `Juliet?`],
            romeo => [Emote.SKEPTICAL, `Juliet! I miss Juliet, terribly!`],
            player => [Emote.SKEPTICAL, `Hmmm, so I see!`],
            goto('tag_FATHER_LAWRENCE')
        ],
        `Where can I find Father Lawrence?`, [
            player => [Emote.POMPOUS, `Where can I find Father Lawrence?`],
            romeo => [Emote.HAPPY, `Lather Fawrence! Oh he's...`],
            romeo => [Emote.SKEPTICAL, `You know he's not my 'real' Father don't you?`],
            player => [Emote.VERY_SAD, `I think I suspected that he wasn't.`],
            romeo => [Emote.HAPPY, `Well anyway...he tells these song, loring bermons...and keeps these here Carrockian vitizens snoring in his church to the East North.`],
            goto('tag_FATHER_LAWRENCE')
        ],
        `Have you heard anything from Juliet?`, [
            player => [Emote.POMPOUS, `Have you heard anything from Juliet?`],
            romeo => [Emote.SAD, `Sadly not my friend! And what's worse, her Father has threatened to kill me if he sees me. I mean, that seems a bit harsh!`],
            player => [Emote.POMPOUS, `Well, I shouldn't worry too much...you can always run away if you see him...`],
            romeo => [Emote.SAD, `I just wish I could remember what he looks like! I live in fear of every man I see!`],
            goto('tag_FATHER_LAWRENCE')
        ],
        `Ok, thanks.`, [
            player => [Emote.GENERIC, `Ok, thanks.`]
        ]
    ];
}

const moreInfo = () => {
    return (options, tag_MORE_INFO) => [
        `Where can I find Juliet?`, [
            player => [Emote.WONDERING, `Where can I find Juliet?`],
            romeo => [Emote.WONDERING, `Why do you ask?`],
            player => [Emote.ANGRY, `So that I can try and find her for you!`],
            romeo => [Emote.WONDERING, `Ah yes....quite right. Hmmm, let me think now.`],
            romeo => [Emote.WONDERING, `She may still be locked away at her Father's house on the sest vide of Warrock.`],
            romeo => [Emote.HAPPY, `Oh, I remember how she loved it when I would sing up to her balcony! She would reward me with her own personal items...`],
            player => [Emote.WONDERING, `What, she just gave you her stuff?`],
            romeo => [Emote.GENERIC, `Well, not exactly give...more like 'throw with considerable force'...she's always a kidder that Juliet!`],
            goto('tag_MORE_INFO')
        ],
        `Is there anything else you can tell me about Juliet?`, [
            player => [Emote.WONDERING, `Is there anything else you can tell me about Juliet?`],
            romeo => [Emote.HAPPY, `Oh, there is so much to tell...she is my true love, we intend to spend together forever...I can tell you so much about her..`],
            player => [Emote.GENERIC, `Great!`],
            romeo => [Emote.WONDERING, `Ermmm.....`],
            romeo => [Emote.WONDERING, `So much can I tell you...`],
            player => [Emote.HAPPY, `Yes..`],
            romeo => [Emote.WONDERING, `So much to tell...why, where do I start!`],
            player => [Emote.GENERIC, `Yes..yes! Please go on...don't let me interrupt...`],
            romeo => [Emote.WONDERING, `Ermmm.....`],
            romeo => [Emote.WONDERING, `...`],
            player => [Emote.WONDERING, `You can't remember can you?`],
            romeo => [Emote.SAD, `Not a thing sorry....`],
            goto('tag_MORE_INFO')
        ],
        `Ok, thanks.`, [
            player => [Emote.GENERIC, `Ok, thanks.`]
        ]
    ];
};

export const romeoDialogueHandler: QuestDialogueHandler = {
    0: async (player: Player, npc: Npc) => {
        const participants = [player, { npc, key: 'romeo' }];

        // Romeo starts with a random line
        const randomDialog = randomBetween(0, 5);
        switch (randomDialog) {
            case 0:
                await dialogue(participants, [
                    romeo => [Emote.SAD, `Blub! Blub...where is my Juliet? Have you seen her?`]
                ]);
                break;

            case 1:
                await dialogue(participants, [
                    romeo => [Emote.SAD, `Looking for a blonde girl, goes by the name of Juliet..quite pretty...haven't seen her have you?`]
                ]);
                break;

            case 2:
                await dialogue(participants, [
                    romeo => [Emote.SAD, `Juliet, Juliet, wherefore art thou Juliet? Have you seen my Juliet?`]
                ]);
                break;

            case 3:
                await dialogue(participants, [
                    romeo => [Emote.SAD, `Oh woe is me that I cannot find my Juliet! You haven't seen Juliet have you?`]
                ]);
                break;

            case 4:
                await dialogue(participants, [
                    romeo => [Emote.SAD, `Sadness surrounds me now that Juliet's father forbids us to meet. Have you seen my Juliet?`]
                ]);
                break;

            case 5:
                await dialogue(participants, [
                    romeo => [Emote.SAD, `What is to become of me and my darling Juliet, I cannot find her anywhere, have you seen her?`]
                ]);
                break;
        }

        await dialogue(participants, [
            options => [
                `Yes, I have seen her actually!`, [
                    player => [Emote.HAPPY, `Yes, I have seen her actually!`],
                    player => [Emote.SKEPTICAL, `At least, I think it was her... Blonde? A bit stressed?`],
                    romeo => [Emote.LAUGH, `Golly...yes, yes...you make her sound very interesting!`],
                    romeo => [Emote.SKEPTICAL, `And I'll bet she's a bit of a fox!`],
                    player => [Emote.SKEPTICAL, `Well, I guess she could be considered attractive...`],
                    romeo => [Emote.LAUGH, `I'll bet she is! Wooooooooo!`],
                    romeo => [Emote.POMPOUS, `Sorry, all that jubilation has made me forget what we were talking about.`],
                    player => [Emote.GENERIC, `You were asking me about Juliet? You seemed to know her?`],
                    romeo => [Emote.HAPPY, `Oh yes, Juliet!`],
                    romeo => [Emote.HAPPY, `The fox...could you tell her that she is the love of my long and that I life to be with her?`],
                    player => [Emote.WONDERING, `What? Surely you mean that she is the love of your life and that you long to be with her?`],
                    romeo => [Emote.HAPPY, `Oh yeah...what you said...tell her that, it sounds much better! Oh you're so good at this!`]
                ],
                `No sorry, I haven't seen her.`, [
                    player => [Emote.GENERIC, `No sorry, I haven't seen her.`],
                    romeo => [Emote.SAD, `Oh...well, that's a shame...I was rather hoping you had.`],
                    player => [Emote.WONDERING, `Why? Is she a fugitive? Does she owe you some money or something?`],
                    romeo => [Emote.WONDERING, `Hmmm, she might do? Perhaps she does? How do you know?`],
                    player => [Emote.ANGRY, `I don't know? I was asking 'YOU' how 'YOU' know Juliet!`],
                    romeo => [Emote.HAPPY, `Ahh, yes Juliet, she's my one true love. Well, one of my one true loves! If you see her, could you tell her that she is the love of my long and that I life to be with her?`],
                    player => [Emote.WONDERING, `What? Surely you mean that she is the love of your life and that you long to be with her?`],
                    romeo => [Emote.HAPPY, `Oh yeah...what you said...tell her that, it sounds much better! Oh you're so good at this!`]
                ],
                `Perhaps I could help to find her for you? `, [
                    player => [Emote.HAPPY, `Perhaps I can help find her for you? What does she look like?`],
                    romeo => [Emote.HAPPY, `Oh would you? That would be great! She has this sort of hair...`],
                    player => [Emote.WONDERING, `Hair...check..`],
                    romeo => [Emote.HAPPY, `...and she these...great lips...`],
                    player => [Emote.WONDERING, `Lips...right.`],
                    romeo => [Emote.HAPPY, `Oh and she has these lovely shoulders as well..`],
                    player => [Emote.GENERIC, `Shoulders...right, so she has hair, lips and shoulders...that should cut it down a bit.`],
                    romeo => [Emote.HAPPY, `Oh yes, Juliet is very different...please tell her that she is the love of my long and that I life to be with her?`],
                    player => [Emote.WONDERING, `What? Surely you mean that she is the love of your life and that you long to be with her?`],
                    romeo => [Emote.HAPPY, `Oh yeah...what you said...tell her that, it sounds much better! Oh you're so good at this!`]
                ]
            ]
        ]);

        await dialogue(participants, [
            options => [
                `Yes, ok, I'll let her know.`, [
                    execute(() => {
                        player.setQuestProgress('rs:romeo_and_juliet', 1);
                    }),
                    player => [Emote.GENERIC, `Yes, ok, I'll let her know.`],
                    romeo => [Emote.HAPPY, `Oh great! And tell her that I want to kiss her a give.`],
                    player => [Emote.ANGRY, `You mean you want to give her a kiss!`],
                    romeo => [Emote.HAPPY, `Oh you're good...you are good!`],
                    romeo => [Emote.HAPPY, `I see I've picked a true professional...!`],
                    moreInfo()
                ],
                `Sorry Romeo, I've got better things to do right now but maybe later?`, [
                    player => [Emote.GENERIC, `Sorry Romeo, I've got better things to do right now but maybe later?`],
                    romeo => [Emote.SAD, `Oh, ok, well, I guess my Juliet and I can spend some time apart. And as the old saying goes, 'Absinthe makes the heart glow longer'.`],
                    player => [Emote.WONDERING, `Don't you mean that, 'Absence makes the...`],
                    player => [Emote.GENERIC, `Actually forget it...`],
                    romeo => [Emote.WONDERING, `Ok!`]
                ]
            ]
        ]);
    },

    1: async (player: Player, npc: Npc) => {
        const participants = [player, { npc, key: 'romeo' }];
        await dialogue(participants, [
            player => [Emote.GENERIC, `Hello again, remember me?`],
            romeo => [Emote.WONDERING, `Of course, yes....how are.. you....ermmm...`],
            player => [Emote.ANGRY, `You haven't got a clue who I am do you?`],
            romeo => [Emote.GENERIC, `Not a clue my friend, but you seem to have a friendly face...a little blood stained, and perhaps in need of a wash, but friendly none the less.`],
            player => [Emote.ANGRY, `You asked me to look for Juliet for you!`],
            romeo => [Emote.HAPPY, `Ah yes, Juliet...my sweet darling...what news?`],
            player => [Emote.WONDERING, `Nothing so far, but I need to ask a few questions? `],
            moreInfo()
        ]);
    },

    2: async (player: Player, npc: Npc) => {
        const participants = [player, { npc, key: 'romeo' }];

        const hasLetterInInventory = player.hasItemInInventory(questItems.julietLetter.gameId);
        if (!hasLetterInInventory) {
            await dialogue(participants, [
                player => [Emote.HAPPY, `Romeo...great news...I've been in touch with Juliet!`],
                romeo => [Emote.HAPPY, `Oh great! That is great news! Well done...well done... what a total success!`],
                player => [Emote.HAPPY, `Yes, and she gave me a message to give you...`],
                romeo => [Emote.HAPPY, `Ohhh great! A message....wow!`],
                player => [Emote.HAPPY, `Yes!`],
                romeo => [Emote.HAPPY, `A message...oh, I can't wait to read what my dear Juliet has to say....`],
                player => [Emote.HAPPY, `I know...it's exciting isn't it...?`],
                romeo => [Emote.HAPPY, `Yes...yes...`],
                romeo => [Emote.BLANK_STARE, `...`],
                romeo => [Emote.SKEPTICAL, `You've lost the message haven't you?`],
                player => [Emote.GENERIC, `Yep, haven't got a clue where it is.`]
            ]);
            return;
        }

        const completedDialogue = await dialogue(participants, [
            player => [Emote.HAPPY, `Romeo...great news...I've been in touch with Juliet! She's written a message for you...`],
            item => [questItems.julietLetter.gameId, `You hand over Juliet's message to Romeo.`],
            romeo => [Emote.HAPPY, `Oh, a message! A message! I've never had a message before...`],
            player => [Emote.POMPOUS, `Really?`],
            romeo => [Emote.HAPPY, `No, no, not one!`],
            romeo => [Emote.POMPOUS, `Oh, well, except for the occasional court summons.`],
            romeo => [Emote.HAPPY, `But they're not really 'nice' messages. Not like this one! I'm sure that this message will be lovely.`],
            player => [Emote.POMPOUS, `Well are you going to open it or not?`],
            romeo => [Emote.HAPPY, `Oh yes, yes, of course! 'Dearest Romeo, I am very pleased that you sent ${player.username} to look for me and to tell me that you still hold affliction...', Affliction! She thinks I'm diseased?`],
            player => [Emote.VERY_SAD, `'Affection?'`],
            romeo => [Emote.SAD, `Ahh yes...'still hold affection for me. I still feel great affection for you, but unfortunately my Father opposes our marriage.'`],
            player => [Emote.SAD, `Oh dear...that doesn't sound too good.`],
            romeo => [Emote.HAPPY, `What? '...great affection for you. Father opposes our..'`],
            romeo => [Emote.SAD, `'...marriage and will...`],
            romeo => [Emote.SHOCKED, `...will kill you if he sees you again!'`],
            player => [Emote.SKEPTICAL, `I have to be honest, it's not getting any better...`],
            romeo => [Emote.SAD, `'Our only hope is that Father Lawrence, our long time confidant, can help us in some way.'`],
            item => [questItems.julietLetter.gameId, `Romeo folds the message away.`],
            romeo => [Emote.SAD, `Well, that's it then...we haven't got a chance...`],
            player => [Emote.SAD, `What about Father Lawrence?`],
            romeo => [Emote.SAD, `...our love is over...the great romance, the life of my love...`],
            player => [Emote.POMPOUS, `...or you could speak to Father Lawrence!`],
            romeo => [Emote.SAD, `Oh, my aching, breaking, heart...how useless the situation is now...we have no one to turn to...`],
            player => [Emote.ANGRY, `FATHER LAWRENCE!`]
        ]);

        if (!completedDialogue) {
            return;
        }

        const slotRemoved = player.removeFirstItem(questItems.julietLetter.gameId);
        if (slotRemoved === -1) {
            return;
        }

        player.setQuestProgress(questKey, 3);

        await dialogue(participants, [
            romeo => [Emote.SHOCKED, `Father Lawrence?`],
            // TODO the next 2 lines should be 1 dialogue
            romeo => [Emote.HAPPY, `Oh yes, Father Lawrence...he's our long time confidant, he might have a solution!`],
            romeo => [Emote.HAPPY, `Yes, yes, you have to go and talk to Lather Fawrence for us and ask him if he's got any suggestions for our predicament?`],
            player => [Emote.POMPOUS, `Where can I find Father Lawrence?`],
            romeo => [Emote.HAPPY, `Lather Fawrence! Oh he's...`],
            romeo => [Emote.SKEPTICAL, `You know he's not my 'real' Father don't you?`],
            player => [Emote.VERY_SAD, `I think I suspected that he wasn't.`],
            romeo => [Emote.HAPPY, `Well anyway...he tells these song, loring bermons...and keeps these here Carrockian vitizens snoring in his church to the East North.`],
            findingFatherLawrence()
        ]);
    },

    3: async (player: Player, npc: Npc) => {
        const participants = [player, { npc, key: 'romeo' }];
        await dialogue(participants, [
            player => [Emote.POMPOUS, `Hey again Romeo!`],
            findingFatherLawrence()
        ]);
    },

    4: async (player: Player, npc: Npc) => {
        // Placeholder for the cutscene at the end, I was bored so I decided to skip to this one
        const participants = [player, { npc, key: 'romeo' }];
        const cont = await dialogue(participants, [
            player => [Emote.HAPPY, `Romeo, it's all set. Juliet has drunk the potion and has been taken down into the Crypt...now you just need to pop along and collect her.`],
            romeo => [Emote.HAPPY, `Ah, right, the potion! Great...`],
            romeo => [Emote.WONDERING, `What potion would that be then?`],
            player => [Emote.SHOCKED, `The Cadava potion...you know, the one which will make her appear dead! She's in the crypt, pop along and claim your true love.`],
            romeo => [Emote.WORRIED, `But I'm scared...will you come with me?`],
            player => [Emote.GENERIC, `Oh , ok...come on! I think I saw the entrance when I visited there last...`]
        ]);

        if (!cont) {
            return;
        }

        await player.interfaceState.fadeOutScreen();
        player.instance = new WorldInstance(uuidv4());
        player.teleport(new Position(2333, 4646));
        player.cutscene = new Cutscene(player, { hideTabs: true, hideMinimap: true });
        const cutsceneRomeo = await world.spawnNpc('rs:romeo', new Position(2333, 4645), 'NORTH', 0, player.instance.instanceId);
        player.face(cutsceneRomeo, true, false, false);

        await dialogue(participants, [
            romeo => [Emote.WORRIED, `This is pretty scary...`],
            player => [Emote.WORRIED, `Oh , be quiet...`],
        ], {
            multi: true
        });

        await player.interfaceState.fadeInScreen();

        player.cutscene.snapCameraTo(2330, 4641);
        player.cutscene.lookAt(2333, 4645, 300);

        await schedule(2);

        await dialogue(participants, [
            player => [Emote.HAPPY, `We're here. Look, Juliet is over there!`]
        ]);

        player.cutscene.snapCameraTo(2334, 4647, 375, 10, 0);
        player.cutscene.lookAt(2322, 4639, 300, 10, 0);

        await schedule(6);

        player.cutscene.snapCameraTo(2324, 4644, 250, 6, 0);
        player.cutscene.lookAt(2321, 4640, 250, 6, 0);

        await schedule(10);

        player.cutscene.snapCameraTo(2330, 4641);
        player.cutscene.lookAt(2333, 4645, 300);

        await schedule(1);

        await dialogue(participants, [
            player => [Emote.HAPPY, `You go over to her...and I'll go and wait over here...`],
            romeo => [Emote.WORRIED, `Ohhh, ok then...`],
        ]);

        player.cutscene.snapCameraTo(2322, 4639, 300);
        player.cutscene.lookAt(2324, 4644, 300);

        cutsceneRomeo.walkingQueue.valid = true;
        cutsceneRomeo.walkingQueue.add(2329, 4645);
        cutsceneRomeo.walkingQueue.add(2327, 4645);
        cutsceneRomeo.walkingQueue.add(2325, 4644);
        cutsceneRomeo.walkingQueue.add(2323, 4643);
        cutsceneRomeo.face(new Position(2322, 4642), false, false, true);
        await cutsceneRomeo.isIdle();

        const cutscenePhillipa = await world.spawnNpc('rs:phillipa', new Position(2333, 4645), 'SOUTHWEST', 0, player.instance.instanceId);
        cutscenePhillipa.walkingQueue.valid = true;
        cutscenePhillipa.walkingQueue.add(2327, 4645);
        cutscenePhillipa.walkingQueue.add(2325, 4644);
        cutscenePhillipa.face(cutsceneRomeo.position, false, false, true);

        const finalParticipants = [player, { npc, key: 'romeo' }, { npc: 'rs:phillipa', key: 'phillipa' }];
        await dialogue(finalParticipants, [
            romeo => [Emote.WORRIED, `Hey...Juliet...`],
            romeo => [Emote.WORRIED, `Juliet...?`],
            romeo => [Emote.SAD, `Oh dear...you seem to be dead.`],
            phillipa => [Emote.HAPPY, `Hi Romeo...I'm Phillipa!`],
        ]);

        cutsceneRomeo.face(cutscenePhillipa, false, false, false);

        await dialogue(finalParticipants, [
            romeo => [Emote.HAPPY, `Wow! You're a fox!`],
            phillipa => [Emote.HAPPY, `It's a shame about Juliet...but perhaps we can meet up later?`],
            romeo => [Emote.HAPPY, `Who's Juliet?`],
        ]);

        await player.interfaceState.fadeOutScreen();
        player.cutscene.endCutscene();
        player.teleport(new Position(3212, 3424));
        player.instance = null;
        await player.interfaceState.fadeInScreen();

        player.setQuestProgress('rs:romeo_and_juliet', 'complete');
    }
}
