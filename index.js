
const { Client, IntentsBitField } = require("discord.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on("ready", (c) => {
    console.log(`${c.user.tag} is online`);
});

const phrases = [
    "?",
    "Who Asked?",
    "We do NOT care.",
    "word.",
    "No one asked???"
];

// User IDs 
// For Privacy ids are empty, if you want to take any of the commands yourself you are welcomed to do so 
const tyId = "";
const myid = "";
const beccaid = "";
const sethid = "";

const neutral = "😐";
const shrug = "🤷";
const flex = "💪";
const speakinghead = "🗣️";
const raisedeyebrow = "🤨";
const camera = "📷";

const numbers = Array.from({ length: 25 }, (v, k) => k + 1);

const conversationStates = {};

// Black Jack Cards
const cards = [2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,
    7,7,7,7,7,7,7,7,8,8,8,8,8,8,8,8,9,9,9,9,9,9,9,9,10,10,10,10,10,10,10,10,"J","J","J","J","J","J","J","J",
    "Q","Q","Q","Q","Q","Q","Q","Q","K","K","K","K","K","K","K","K","A","A","A","A","A","A","A","A"
];

function calculateTotal(cards) {
    let total = 0;
    let aceCount = 0;

    for (const card of cards) {
        if (['J', 'Q', 'K'].includes(card)) {
            total += 10;
        } else if (card === 'A') {
            total += 11;
            aceCount += 1;
        } else {
            total += card;
        }
    }
    // Adjust for aces if total is over 21
    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount -= 1;
    }

    return total;
}

async function startBlackjack(msg) {
    await msg.reply("Welcome to the best game created, are you ready? (y/n)");

    const filter = response => response.author.id === msg.author.id;
    const yesnocollector = msg.channel.createMessageCollector({ filter, time: 30000 });

    yesnocollector.on('collect', async m => {
        if (m.content.toLowerCase() === "y") {
            await msg.reply("Let's get started then!\nThis bot assumes you know how to play, so I hope you do!\nHere are your cards:");

            // Initialize game
            const currcards = [];
            for (let i = 0; i < 4; i++) {
                const randomIndex = Math.floor(Math.random() * cards.length);
                currcards.push(cards[randomIndex]);
            }

            const botcards = [currcards[0], currcards[3]];
            const playercards = [currcards[1], currcards[2]];

            await msg.channel.send(`Your cards are: ${playercards.join(', ')}\nYour total is: ${calculateTotal(playercards)}`);
            console.log(`Bot's cards are: ${botcards.join(', ')}\nBot's total: ${calculateTotal(botcards)}`);
            await msg.channel.send(`The Dealer is showing: ${currcards[0]}`);

            // Create the game collector for hit/stand responses
            await msg.reply("Do you want to hit or stand?");
            const gameCollector = msg.channel.createMessageCollector({ filter, time: 30000 });

            gameCollector.on('collect', async response => {
                if (response.content.toLowerCase() === "hit") {
                    // Draw a new card
                    const newCard = cards[Math.floor(Math.random() * cards.length)];
                    playercards.push(newCard);
                    const total = calculateTotal(playercards);
                    await msg.channel.send(`You drew a ${newCard}. Your total is ${total}.`);

                    // Check if the player busts
                    if (total > 21) {
                        await msg.channel.send(`You busted. Game over! ${neutral}`);
                        gameCollector.stop(); // Stop the collector if the player busts
                        await askToPlayAgain(msg, filter); // Ask to play again
                    } else {
                        // Ask the user to choose again
                        await msg.reply("Do you want to hit or stand?");
                    }
                } else if (response.content.toLowerCase() === "stand") {
                    // Reveal dealer’s cards and finish the game
                    await msg.channel.send(`Dealer's cards are: ${botcards.join(', ')}\nDealer's total is ${calculateTotal(botcards)}.`);

                    // Dealer logic: hits until reaching 17 or more
                    while (calculateTotal(botcards) < 17) {
                        const newBotCard = cards[Math.floor(Math.random() * cards.length)];
                        botcards.push(newBotCard);
                        await msg.channel.send(`Dealer drew a ${newBotCard}. Dealer's total is now ${calculateTotal(botcards)}.`);
                    }

                    if (calculateTotal(botcards) > 21) {
                        await msg.channel.send("Dealer busted. You win!");
                    } else {
                        const playerTotal = calculateTotal(playercards);
                        const botTotal = calculateTotal(botcards);
                        if (playerTotal > botTotal) {
                            await msg.channel.send("You win!");
                        } else if (playerTotal < botTotal) {
                            await msg.channel.send("Dealer wins!");
                        } else {
                            await msg.channel.send("It's a tie!");
                        }
                    }
                    
                    // Ask if the player wants to play again
                    await askToPlayAgain(msg, filter);
                    gameCollector.stop(); // Stop the collector when the game ends
                } else {
                    await msg.reply("Please reply with 'hit' or 'stand'.");
                }
            });

            gameCollector.on('end', collected => {
                if (collected.size === 0) {
                    msg.reply(`You didn't respond in time. You're a bum ${neutral}`);
                }
            });

            yesnocollector.stop();
        } else if (m.content.toLowerCase() === "n") {
            await msg.reply(`You're a bum ${neutral}`);
            yesnocollector.stop();
        }
    });

    yesnocollector.on('end', collected => {
        if (collected.size === 0) {
            msg.reply(`You didn't respond in time. You're a bum ${neutral}`);
        }
    });
}
// Function to play again
async function askToPlayAgain(msg, filter) {
    await msg.reply("Do you want to play again? (y/n)");
    const playAgainCollector = msg.channel.createMessageCollector({ filter, time: 30000 });

    playAgainCollector.on('collect', async playAgainResponse => {
        if (playAgainResponse.content.toLowerCase() === "y") {
            playAgainCollector.stop(); 
            // Restart the game
            await startBlackjack(msg);
        } else if (playAgainResponse.content.toLowerCase() === "n") {
            playAgainCollector.stop(); 
        } else {
            await msg.reply("Please reply with 'y' or 'n'.");
        }
    });

    playAgainCollector.on('end', collected => {
        if (collected.size === 0) {
            msg.reply(`You didn't respond in time. Thanks for playing!`);
        }
    });
}

// Message in the server
client.on("messageCreate", async (msg) => {
    // Strip messages
    const stripped = msg.content.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // Make sure bot doesn't take bot messages
    if (msg.author.bot) {
        return;
    }

    // Randomizer
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const randomphrase = phrases[randomIndex];

    // Seth's messages
    if (msg.author.id === sethid) {
        console.log("Message from Seth detected");
        const randomnumber = numbers[Math.floor(Math.random() * numbers.length)];
        console.log("number is ", randomnumber);

        if (randomnumber === 3) {
            console.log("Reacting with neutral emoji");
            msg.react(neutral);
        }
    }

    // Ty's messages
    if (msg.author.id === tyId) {
        const randomnumber = numbers[Math.floor(Math.random() * numbers.length)];
        console.log("number is ", randomnumber);

        if (msg.content.includes("?") && randomnumber === 3) {
            msg.reply(randomphrase);
        }

        if (randomnumber === 3) {
            msg.reply("I love you ty :D");
        }

        if (stripped === "im better") {
            msg.reply("Ty is the third coolest person in this entire server.");
        }
    }

    // My messages
    if (msg.author.id === myid) {
        if (stripped === "im better") {
            msg.reply("D'vin is just better than you :P");
        }

        if (msg.content === "!love") {
            msg.reply("I am in love with ty!, don't check the account name :D");
        }

        if (stripped.includes("not like us")) {
            msg.reply("Not like us?");
            setTimeout(async () => {
                await msg.reply("Mustard on the beat hoe");
            }, 1000);

            setTimeout(async () => {
                await msg.reply("deebo");
            }, 2000);

            setTimeout(async () => {
                await msg.reply("any rap nigga a free throw");
                conversationStates[msg.author.id] = 'waiting_for_man_down';
                // Wait for user input to continue
                const filter = response => response.author.id === msg.author.id;
                const mandowncollector = msg.channel.createMessageCollector({ filter, time: 30000 });

                mandowncollector.on('collect', (response) => {
                    if (response.content.toLowerCase() === 'man down') {
                        mandowncollector.stop(); // Stop collecting after receiving the input
                    }
                });

                mandowncollector.on('end', collected => {
                    if (conversationStates[msg.author.id] === 'waiting_for_man_down') {
                        msg.reply('call an amberlamps tell him "breathe bro"');
                        setTimeout(() => { 
                            msg.reply("nail a nigga to the cross");
                        }, 1000);

                        setTimeout(() => {
                            msg.reply("he walk around like teezo");
                        }, 2000);

                        conversationStates[msg.author.id] = 'sequence_done'; // Update state to done
                    }
                });

            }, 3000);
        }
    }

    // Becca's Messages
    if (msg.author.id === beccaid && stripped === "im better") {
        msg.reply(`Becca will always be number one, it's just a fact ${shrug}`);
    }

    // Global commands
    if (msg.content.toLowerCase() === "!flip") {
        const outcome = Math.random() < 0.5 ? "Heads" : "Tails";
        msg.reply("The outcome is...");

        setTimeout(() => {
            msg.reply(`${outcome}`);
        }, 1500);
    }
    
    if (msg.content.toLowerCase() === "!born") {
        msg.reply("I was born on August 5th because D'vin was bored");
    }
    
    if (stripped === "beat yo ass and hide the bible if god watching") {
        setTimeout(async () => {
            await msg.reply(`sometimes you gotta pop out and show niggas ${flex}`);
        }, 1000);

        setTimeout(async () => {
            await msg.reply(`certified boogie man im the one the up the score with em ${speakinghead}`);
        }, 2000);  
    }


    if (msg.content.toLowerCase() === "!help") {
        msg.reply(` Here are the public commands I can currently do!\n Current Commands:\n !flip (to flip a coin)\n !blackjack (to play blackjack)\n And a bunch of random things!`);
    }

    // Blackjack command
    if (msg.content.toLowerCase() === "!blackjack") {
        await startBlackjack(msg);
    }
});



client.login("Your Bot Token Here");
