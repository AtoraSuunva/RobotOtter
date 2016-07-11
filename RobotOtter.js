/*jshint esversion: 6 */
/*jshint evil: true*/
//MUAHAHAHAHA I'M EVIL

const Discord = require('discord.js'); //Handles the API
const Auth = require('./auth.json'); //Auth details
const Settings = require('./settings.json'); //i have no idea
const Puns = require('./puns.json'); //So many cat puns you'll be cat-atonic!
const fs = require('fs'); //rw functionality
const Cleverbot = require('cleverbot-node'); //actually not very clever sometimes

var ServerSettings = require('./serverSettings.json'); //Per-server settings

var prefix        = ((Settings.prefix !== undefined)               ? Settings.prefix        : '!');
var maxDiceTimes  = ((Number.isSafeInteger(Settings.maxDiceTimes)) ? Settings.maxDiceTimes  :  10);
var maxDiceSides  = ((Number.isSafeInteger(Settings.maxDiceSides)) ? Settings.maxDiceSides  : 256);
var maxModifier   = ((Number.isSafeInteger(Settings.maxModifier))  ? Settings.maxModifier   : 256);
var maxCoinFlips  = ((Number.isSafeInteger(Settings.maxCoinFlips)) ? Settings.maxCoinFlips  :  10);

var subreddit = ((typeof Settings.subreddit === 'boolean') ? Settings.subreddit : false);
var memes = ((typeof Settings.memes === 'object') ? Settings.memes : {
    "wew": false,
    "ayy": false,
    "cat": false,
    "sad": false,
    "kms": false,
    "kys": false,
    "wakeup": false,
    "familyFriendly": false
  });

//The use of the terniary operator is to check each setting to ensure it's (somewhat) correct.
//A 'maxDiceSides' of 'apple' is useless
//So if the setting is invalid, we default to settings that work.

//Variables!
const multiWordRegex = /(\w+)/g;
const wordRegex = /\s(\w+)/; //the one to rule them all
const numberRegex = /(-?\d+)/;     //get number
const diceRegex = /(\d+)?d(\d+)([-+*/])?(\d+)?d?(\d+)?/; //get numbers from dice string 1d3+5d6 => ['1d3+5d6', '1', '3', '+', '5', '6']
                                                         //                             4d5     => ['4d5'    , '4', '5', undefined, undefined, undefined]
var messagesSeen = 0;
var messagesServed = 0;
var memeSettings = '';

var serverId = ''; //I know global variables are horrible but the other way of getting DMs to work looks horrible

for (var i in memes) {
    memeSettings += '   ' + i + ': ' + memes[i] + '\n';
}

console.log('\n=========================================' +
            '\n' + 'Current Default Settings:' +
            '\n' + 'prefix       : ' + prefix +
            '\n' + 'maxDiceTimes : ' + maxDiceTimes +
            '\n' + 'maxDiceSides : ' + maxDiceSides +
            '\n' + 'maxModifier  : ' + maxModifier +
            '\n' + 'maxCoinFlips : ' + maxCoinFlips +
            '\n' + 'subreddit    : ' + subreddit +
            '\n' + 'memes        : { \n' + memeSettings +
            '}\n\n' + 'If any settings are different than the ones in settings.json, then you incorrectly entered them.' +
            '\n=========================================');

var robotOtter = new Discord.Client({
  "autoReconnect": true
});

robotOtter.userAgent.url = "https://github.com/AtlasTheBot/RobotOtter-Discord";
const currentVersion = "1.1.1";
const INVITE_LINK = "https://discordapp.com/oauth2/authorize?client_id=189078347207278593&scope=bot&permissions=0";

robotOtter.on("ready", function() {
	console.log('My body is ready! Memeing in: \n' +
                robotOtter.servers.length + ' servers,\n' +
                robotOtter.channels.length + ' channels.');

    robotOtter.setPlayingGame('!?!help | goo.gl/nNpZYR');
});

robotOtter.on('message', function(message) { //switch is for the weak
  if (message.author.equals(robotOtter.user) || message.author.bot) return; //Don't reply to itself or bots

  message.content = cleanMessage(message); //Clean stuff between `` so it doesn't bother reading code

  if (message.channel.server !== undefined) {
    serverId = message.channel.server.id;
  } else {
    serverId = 'dm' + message.author.id; //Settings for DMs (user specific)
  }

  createServerSettings(serverId); //Create settings if none exist (also DM settings)

  messagesSeen++;

      // COMMANDS

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'help') || message.content.beginsWith('!?!help')) {
      help(message);
      messagesServed++;
      return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'roll')) {
      roll(message);
      messagesServed++;
      return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'flip')) {
      flip(message);
      messagesServed++;
      return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'choose')) {
      choose(message);
      messagesServed++;
      return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'pun')) {
    pun(message);
    messagesServed++;
    return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'stats')) {
    stats(message);
    messagesServed++;
    return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'info')) {
    info(message);
    messagesServed++;
    return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'image')) {
    image(message);
    messagesServed++;
    return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'invite')) {
    robotOtter.sendMessage(message.channel, INVITE_LINK);
    messagesServed++;
    return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'wiki')) {
    wiki(message);
    messagesServed++;
    return;
  }

      //MEMES

  if (message.content.toLowerCase().includes('wew') && !message.content.toLowerCase().includes('lad') && ServerSettings[serverId].memes.wew) { //wew lad
    robotOtter.sendMessage(message.channel, 'lad');
    messagesServed++;
    return;
  }

  if (message.content.toLowerCase().includes('ayy') && !message.content.toLowerCase().includes('lmao') && ServerSettings[serverId].memes.ayy) { //wew lad
    if (message.content.toLowerCase().includes('lmoa')) {
        robotOtter.sendMessage(message.channel, '*lmao');
    } else {
        robotOtter.sendMessage(message.channel, 'lmao');
    }
    messagesServed++;
    return;
  }

  if (message.content === 'Cat.' && ServerSettings[serverId].memes.cat) { //Cat.
    robotOtter.sendMessage(message.channel, 'Cat.');
    messagesServed++;
    return;
  }

  if (message.content.includes(':(') && ServerSettings[serverId].memes.sad) { //Don't be sad!
    robotOtter.sendMessage(message.channel, ':)');
    messagesServed++;
    return;
  }

  if ((message.content.includes('kms') || message.content.toLowerCase().includes('kill myself')) && ServerSettings[serverId].memes.kms) { //don't do it
    robotOtter.sendMessage(message.channel, 'http://www.suicidepreventionlifeline.org/');
    messagesServed++;
    return;
  }

  if ((message.content.includes('kys') || message.content.toLowerCase().includes('kill yourself')) && ServerSettings[serverId].memes.kys) { //rude
    robotOtter.sendMessage(message.channel, 'Wow rude.');
    messagesServed++;
    return;
  }

  if (message.content.beginsWith(ServerSettings[serverId].prefix + 'wakeup') && ServerSettings[serverId].memes.wakeup) { //WAKE ME UP INSIDE
    robotOtter.sendMessage(message.channel, 'CAN\'T WAKE UP.');
    messagesServed++;
    return;
  }

  if ((message.content.toLowerCase().includes('fuck') || message.content.toLowerCase().includes('bitch') || message.content.toLowerCase().includes('shit')) &&
       ServerSettings[serverId].memes.familyFriendly) { //don't talk to me or my bot ever again

    robotOtter.sendMessage(message.channel, 'This is a family friendly chat, don\'t you ever fucking swear again.');
    messagesServed++;
    return;
  }

      //MOD COMMANDS
  if (serverId !== 'dm') { //settings in DMs works differently
    if (message.content.beginsWith(ServerSettings[serverId].prefix + ServerSettings[serverId].prefix + 'setting') && (userHasPermission(message.channel.server, message.author, 'manageServer') || message.channel.name === 'bot-settings')) { //Nice and long ;)
      setting(message);
      messagesServed++;
      return;
    }
  } else {
    if (message.content.beginsWith(ServerSettings[serverId].prefix + ServerSettings[serverId].prefix + 'setting')) { //no check for DMs
      setting(message);
      messagesServed++;
      return;
    }
  }

  if (message.content.beginsWith('~eval')) {

    if (message.author.id !== "74768773940256768") { //ain't nobody else runnin' eval on my watch
        robotOtter.sendMessage(message.channel, 'Nice try, but no.');
        return;
    }

    var content = message.content.replace('~eval', '');

    console.log('-=-=-=-=-=-=-=-');

    try {
        var result = eval(content);
        console.log(result);
        robotOtter.sendMessage(message.channel, '`' + result + '`');
    } catch (err) {
        console.log(err);
        robotOtter.sendMessage(message.channel, '`' + err + '`');
    }
  }

  if (message.isMentioned(robotOtter.user) || serverId.beginsWith('dm')) {//I forgot .beginsWith I swear I'm retarded sometimes
    cleverMessage = message.content.replace(/<@\d*?>,? ?/, ''); //clear mentions of robotOtter

    if (ServerSettings[serverId].hidden.cleverBot === null) ServerSettings[serverId].hidden.cleverBot = new Cleverbot(); //just in case

    Cleverbot.prepare(function() {
        ServerSettings[serverId].hidden.cleverBot.write(cleverMessage, function (response) {
        robotOtter.reply(message, response.message); //woo confusing variables
      });
    });

    return;
  }
});

robotOtter.on('serverCreated', function(server) {
    createServerSettings(server.id);
});

function help(message) {
    console.log('Help! ');

    var commandName = ((message.content.match(wordRegex) !== null) ? message.content.match(wordRegex)[1] : 'No match :(' );

    console.log(message.content);
    console.log(commandName);

    var helpText = '';

    switch (commandName.toLowerCase()) {
        case 'roll':
            helpText = '\n' + 'Formatting: ' + ServerSettings[serverId].prefix + 'roll {times}d{sides}[+-*/]{times}d{sides} OR {modifier} ' +
                       '\n' + '{times}: Number of dice rolls (max. ' + maxDiceTimes + ')' +
                       '\n' + '{sides}: Number of sides per die (max. ' + maxDiceSides + ')' +
                       '\n' + '[+-*/]: (Monster) math operator to use' +
                       '\n' + '{modifier}: Number to modify the roll by' +
                       '\n' + 'Example: !roll 2d20 => {8} + {14} = 22';
            break;

        case 'flip':
            helpText = '\n' + 'Formatting: ' + ServerSettings[serverId].prefix + 'flip {times} ' +
                       '\n' + '{times}: Number of coin flips (max. ' + maxCoinFlips + ')' +
                       '\n' + 'Example: !flip 2 => {T} + {H} = [H = 1] : [T = 1]';
            break;

        case 'choose':
            helpText = '\n' + 'Formatting: ' + ServerSettings[serverId].prefix + 'choose {item1, item2,... itemN}' +
                       '\n' + '{itemN}: Items to select from' +
                       '\n' + 'Example: !choose yes, no => -> yes';
            break;

        case 'pun':
            helpText = '\n' + 'Formatting: ' + ServerSettings[serverId].prefix + 'pun {*cat*-egory}' +
                       '\n' + '{*cat*-egory}: Kind of puns' +
                       '\n' + 'Example: !pun cat => *Purr*fect = Perfect';
            break;

        case 'stats':
            helpText = 'It\'s just ' + ServerSettings[serverId].prefix + 'stats. Nothing more, nothing less.';
            break;

        case 'info':
            helpText = 'What more do you want from me?';
            break;

        case 'wiki':
            if (!ServerSettings[serverId].subreddit) break; //no
            helpText = '\n' + 'Formatting: ' + ServerSettings[serverId].prefix + 'wiki [page] ' +
                       '\n' + '[page]: Page name to show: ' +
                       '\n' + '[items, quests, players, locations]' +
                       '\n' + 'Example: !wiki players => /r/OtterDnD/wiki/players';
            break;

        case 'help':
            helpText = 'Congrats! You mastered ' + ServerSettings[serverId].prefix + 'help';
            break;

        case 'me':
            helpText = 'It\'s too late, you cannot be saved.';
            break;

        default:
            helpText = '\n' + 'Currently using "' + ServerSettings[serverId].prefix + '" as a prefix.' +
						'\n' + ServerSettings[serverId].prefix + 'help [command] - Brings this help menu or help for a specific command.' +
						'\n' + ServerSettings[serverId].prefix + 'roll {times}d{dice} - Rolls a dice following the DnD style.' +
						'\n' + ServerSettings[serverId].prefix + 'flip {times} - Filps a coin {# of flips} times.' +
						'\n' + ServerSettings[serverId].prefix + 'choose {item1, item2,... itemN} - Chooses an item from a list.' +
						'\n' + ServerSettings[serverId].prefix + 'pun {*cat*-egory} - Says a pun.' +
						'\n' + ServerSettings[serverId].prefix + 'stats - RobotOtter stats' +
						'\n' + ServerSettings[serverId].prefix + 'info - Info about RobotOtter' +
						((ServerSettings[serverId].subreddit) ? ('\n' + ServerSettings[serverId].prefix + 'wiki [page] - Link to the OtterDnD wiki, or link directly to [page] (ie. location, players).') : ('')) +
						'\n' + '{Required} - [Optional]' +
            '\n' + '@mention me to talk to me!';
    }

    robotOtter.reply(message, helpText);
    console.log('------');
}

function roll(message) {
    console.log('Roll ' + message.content + '!');

    var match = message.content.match(diceRegex);
    if (match === null){
      robotOtter.reply(message, 'Try using dice notation (1d6)');
      return;
    }

    var times         = ((Number.isSafeInteger(parseInt(match[1], 10))) ? parseInt(match[1], 10) : 1 ); //gotta be safe
    var diceSides     = ((Number.isSafeInteger(parseInt(match[2], 10))) ? parseInt(match[2], 10) : 20); //defaults to 1d20
    var symbol        = ((match[3] !== undefined)                       ?          match[3]      : ''); //defaults to empty
    var times2        = ((Number.isSafeInteger(parseInt(match[4], 10))) ? parseInt(match[4], 10) : ''); //defaults to empty
    var diceSides2    = ((Number.isSafeInteger(parseInt(match[5], 10))) ? parseInt(match[5], 10) : ''); //defaults to empty

    if (times > ServerSettings[serverId].maxDiceTimes || diceSides > ServerSettings[serverId].maxDiceSides) {
        robotOtter.reply(message, 'Max times you can roll is ' + ServerSettings[serverId].maxDiceTimes + '. Max sides per die is ' + ServerSettings[serverId].maxDiceSides + '.');
        return;
    }

    if (times <= 0 || diceSides <= 0) { //Hardcoded because it's impossible to roll a dice 0 times, or a 0-sided die. Try it, I dare you.
        robotOtter.reply(message, 'You can\'t roll a die 0 or negative time. Try it, I dare you.');
        return;
    }

    console.log('match    : ' + '[' + match + ']');
    console.log('times    : ' + times);
    console.log('diceSides : ' + diceSides);
    console.log('symbol   : ' + symbol);
    console.log('times2   : ' + times2);
    console.log('diceSides2: ' + diceSides2);
    console.log('-----');

    var diceString = '';
    var diceTotal = 0;
    var currentRoll = 0;

    for (i = times; i > 0; i--) {
        currentRoll = rollDice(diceSides);
        diceTotal += currentRoll;
        diceString +=  currentRoll + ((i === 1) ? ' ' : ' + ');

        console.log(currentRoll);
        console.log(i);
        console.log(diceString);
        console.log(diceTotal);
    }

    console.log('-----');

    if (symbol !== '' && ((times2 !== '') || (diceSides2 !== ''))) {
        diceString += '= ' + diceTotal + ' ' + symbol + ' ';

        if (times2 !== '' && diceSides2 === '') {
            if (times2 > ServerSettings[serverId].maxModifier) {
                robotOtter.reply(message, 'Max modifier is ' + ServerSettings[serverId].maxModifier + '.');
                return;
            }
            diceTotal = parseEquation(diceTotal, symbol, times2);
            diceString += times2;
        }else {
            if (times2 > ServerSettings[serverId].maxDiceTimes || diceSides2 > ServerSettings[serverId].maxDiceSides) {
                robotOtter.reply(message, 'Max times you can roll is ' + ServerSettings[serverId].maxDiceTimes + '. Max sides per die is ' + ServerSettings[serverId].maxDiceSides + '.');
                return;
            }

            if (times2 <= 0 || diceSides2 <= 0) { //Hardcoded because it's impossible to roll a dice 0 times, or a 0-sided die.
                robotOtter.reply(message, 'You can\'t roll a die 0 or negative time. Try it, I dare you.');
                return;
            }

            var diceTotal2 = 0;
            times2 = ((times2 !== '') ? times2 : 1);

            for (i = times2; i > 0; i--) {
                diceTotal2 += rollDice(diceSides2);
                console.log(i);
                console.log(diceTotal2);
            }
            diceTotal = parseEquation(diceTotal, symbol, diceTotal2);
            diceString += diceTotal2;
        }
        diceString += '';
    }


    diceString += '\n' + '=> ' + diceTotal;

    robotOtter.reply(message, diceString);

    if (diceSides === 1) {
        robotOtter.reply(message, 'Seriously? What did you expect?');
    }

    console.log('-----');
}

function flip(message) {
    console.log('Coin Flip ' + message.content + '!');

    var match = message.content.match(numberRegex);
    if (match === null) match = [1];
    var times = ((Number.isSafeInteger(parseInt(match[0], 10))) ? parseInt(match[0], 10) : 1); //gotta be safe

    if (times > ServerSettings[serverId].maxCoinFlips) {
      robotOtter.reply(message, 'Try flipping ' + ServerSettings[serverId].maxCoinFlips + ' times or less.');
      return;
    }

    if (times === 0) {
      robotOtter.reply(message, 'I\'m so good at flipping, I\'ve already flipped ***0*** coins!');
      return;
    }

    if (times < 0) {
      robotOtter.reply(message, 'Try flipping a physically possible amount of times.');
      return;
    }

    var heads = 0; //1
    var tails = 0; //2
    var coinString = '';
    var currentFlip = 0;

    for (var i = times; i > 0; i--) {
        currentFlip = rollDice(2); //coins are actually dice

        if (currentFlip === 1) {
            heads++;
        } else {
            tails++;
        }

        coinString += '(' + ((currentFlip === 1) ? 'H' : 'T' ) + ((i === 1) ? ') ' : ') + ');

        console.log(currentFlip);
        console.log(i);
        console.log(coinString);
        console.log('H = ' + heads);
        console.log('F = ' + tails);
    }

    coinString += '\n' + '= ' + heads + '(H), ' + tails + '(T)';

    robotOtter.reply(message, coinString);
    console.log('-----');
}

function choose(message) {
  console.log('!choose');
  var choices = message.content.replace(/(\s*,\s*)/g, ',').substring(8).split(','); //.filter() ;^)
  choices = choices.filter(function(e) {return e !== '';}); //clear empty values (be glad it's not a one-liner)

  if (choices[0] !== undefined && choices.length > 1) {
    robotOtter.reply(message, '\n-> ' + choices[Math.floor(Math.random()*choices.length)]);
  } else if (choices[0] !== undefined) {
    robotOtter.reply(message, '\n-> Really?');
  } else {
    robotOtter.reply(message, '\n-> Nothing, you gave me no choice. What did you expect?');
  }

  //Sometimes you need to be concise
  //Because nobody else will see your code :(
  //But maybe that's a good thing :)
  console.log('-----');
}

function pun(message) {
  console.log('!pun');

  var category = 'default';

  if (message.content.match(wordRegex) !== null) {
    category = message.content.match(wordRegex)[1];
  }

  console.log(category);

  if (Puns[category] !== undefined) {
    robotOtter.reply(message, Puns[category][Math.floor(Math.random() * Puns[category].length)]);
  } else {
    robotOtter.reply(message, Puns['default'][Math.floor(Math.random() * Puns['default'].length)]);
  }
  console.log('-----');
}

function stats(message) {
  robotOtter.sendMessage(message.channel,
                'Currently serving:' + '\n' +
                robotOtter.servers.length + ((robotOtter.servers.length !== 1 ) ? ' servers,' : ' server,') + '\n' +
                robotOtter.users.length + ((robotOtter.users.length !== 1 ) ? ' users,' : ' user,') + '\n' +
                robotOtter.channels.length + ((robotOtter.channels.length !== 1 ) ? ' channels,' : ' channel,') + '\n' +
                robotOtter.privateChannels.length + ((robotOtter.privateChannels.length !== 1 ) ? ' private chats,' : ' private chat,') + '\n' +
                'Up for: ' + msToTime(robotOtter.uptime) + '\n' +
                'Seen ' + messagesSeen + ((messagesSeen !== 1) ? ' messages, ' : ' message, ') + 'served ' + messagesServed + ' (' + Math.floor((messagesServed / messagesSeen) * 100) + '%)'
                );
}

function info(message) {
    robotOtter.sendMessage(message.channel,
                'RobotOtter V' + currentVersion + ' by AtlasTheBot (@Atlas)' + '\n' +
                'Source: https://github.com/AtlasTheBot/RobotOtter-Discord' + '\n' +
                'Official Chat: https://discord.gg/0w6AYrrMIUfO71oV' + '\n' +
                'Made with tears and love'
                );
}

function image(message) {
  console.log('image');
  var fileNames = fs.readdirSync('./images'); //Images in a folder called "images" in the same folder as the script
  //fileNames is an array of file names

  var fileChosen = fileNames[Math.floor(Math.random() * fileNames.length)]; //Randomly choose one

  robotOtter.sendFile(message.channel, './images/' + fileChosen); //Send the message
}

function wiki(message) {
    if (ServerSettings[serverId].subreddit) return;
    console.log('!Wiki ' + message.content);
    var page = message.content.match(wordRegex)[1];

    var match = ((page !== null) ? page.toLowerCase() : '');

    switch (match) {
        case 'items':
            robotOtter.reply(message, 'Item List: https://reddit.com/r/OtterDnD/wiki/items');
            break;
        case 'quests':
            robotOtter.reply(message, 'Quest List: https://reddit.com/r/OtterDnD/wiki/quests');
            break;
        case 'players':
            robotOtter.reply(message, 'Players List: https://reddit.com/r/OtterDnD/wiki/players');
            break;
        case 'locations':
            robotOtter.reply(message, 'Locations List: https://reddit.com/r/OtterDnD/wiki/locations');
            break;
        default:
            robotOtter.reply(message, 'Wiki: https://reddit.com/r/OtterDnD/wiki');
    }
    console.log('-----');
}

// MOD FUNCTIONS

function setting(message) {
    console.log('===');
    console.log('Settings!');
    if (message.content.split(' ') !== null) {
        var setting = message.content.split(' '); //["setting", "[setting]", "[value]"]

        console.log(setting);
        var currentSettings = '';

        if (setting[2] !== undefined) { //all args supplied
            console.log('Setting ' + setting[1]);
            currentSettings = setSetting(serverId, setting[1], setting[2]);
            robotOtter.sendMessage(message.channel, currentSettings);

        } else if (setting[1] !== undefined) { //"[setting]" supplied
            console.log('Getting ' + setting[1]);
            currentSettings = getCurrentSettings(serverId, setting[1]);
            robotOtter.sendMessage(message.channel, currentSettings);

        } else { //No args supplied
            console.log('Getting all settings');
            currentSettings = getCurrentSettings(serverId);
            robotOtter.sendMessage(message.channel, currentSettings + '\nChange settings with `' + ServerSettings[serverId].prefix + ServerSettings[serverId].prefix + 'setting [setting] [newValue]`.');
        }
    }
}

//EXTRA NON-COMMAND FUNCTIONS

String.prototype.beginsWith = function (string) {
    return (this.indexOf(string) === 0);
};

const thingsToClean = [/`{1,}\n?(.*\n?)*`{1,}/]; //In case I want to expand the black list later
//HORRIBLE CONFUSING REGEX GO!

function cleanMessage(message) { //wosh your code
  var cleanContent = message.content; //wow well done look at the effort

  for (i = 0; i <= thingsToClean.length; i++) { //JSHint screams if you declare i (var i)
      cleanContent = cleanContent.replace(thingsToClean[i], '');
  }

  return cleanContent;
}

function rollDice(max) {
    return Math.floor(Math.random() * (max)) + 1;
}

function parseEquation(num1, symbol, num2) { //Does 'num1 symbol num2': prsEqtn(1, '+', 1) => 2
    //this is probably a horrible way of doing it but you should never trust eval(), it's  *evil* (Get it? E-val, E-vil?)
    switch (symbol) {
        case '-':
            num1 -= num2;
            break;

        case '+':
            num1 += num2;
            break;

        case '*':
            num1 *= num2;
            break;

        case '/':
            num1 /= num2;
            break;

        default:
            console.log('Error in parseEquation()!');
    }
    return num1;
}

function msToTime(duration) {
    var seconds    = parseInt((duration/1000)%60),
        minutes    = parseInt((duration/(1000*60))%60),
        hours      = parseInt((duration/(1000*60*60))%24),
        days       = parseInt((duration/(1000*60*60*24)));

    var timeString = ((days    >= 1) ? ((days    > 1) ? days    + ' Days '   : days    + ' Day ')    : '') +
                     ((hours   >= 1) ? ((hours   > 1) ? hours   + ' Hours '  : hours   + ' Hour ')   : '') +
                     ((minutes >= 1) ? ((minutes > 1) ? minutes + ' Minutes ': minutes + ' Minute ') : '') +
                     ((seconds >= 1) ? ((seconds > 1) ? seconds + ' Seconds' : seconds + ' Second')  : '');

    return timeString;
}

function getCurrentSettings(serverId, setting) {
    if (setting === undefined) {
        var memeSettings = '';

        for (var i in ServerSettings[serverId].memes) {
            memeSettings += '   ' + i + ': ' + ServerSettings[serverId].memes[i] + '\n';
        }
        var settingsString = //TODO: make this automatic
        '```' +
        '\n' + 'Current Settings:' +
        '\n' + 'prefix       : ' + ServerSettings[serverId].prefix +
        '\n' + 'maxDiceTimes : ' + ServerSettings[serverId].maxDiceTimes +
        '\n' + 'maxDiceSides : ' + ServerSettings[serverId].maxDiceSides +
        '\n' + 'maxModifier  : ' + ServerSettings[serverId].maxModifier +
        '\n' + 'maxCoinFlips : ' + ServerSettings[serverId].maxCoinFlips +
        '\n' + 'subreddit    : ' + ServerSettings[serverId].subreddit +
        '\n' + 'memes        : {\n' + memeSettings + '\n}' +
        '\n' + '```';

        return settingsString;
    } else {
        if (ServerSettings[serverId][setting] !== undefined) {
            return '`' + setting + ' = ' + ServerSettings[serverId][setting] + '`';
        } else if (ServerSettings[serverId].memes[setting] !== undefined) {
            return '`' + setting + ' = ' + ServerSettings[serverId].memes[setting] + '`';
        } else {
            return '`No setting was found.`';
        }
    }
}

function setSetting(serverId, setting, newValue) {
  //WOoOoOo it's a wave!
  var response = '';
    if (ServerSettings[serverId][setting] !== undefined) {
        if (typeof ServerSettings[serverId][setting] === 'string') {
            if (typeof newValue === 'string') {
                ServerSettings[serverId][setting] = newValue;
                response = '`' + setting + ' = ' + ServerSettings[serverId][setting] + '`';
            } else {
                response = 'You need a string';
            }
        } else

        if (typeof ServerSettings[serverId][setting] === 'boolean') {
            if (newValue.toLowerCase() == 'true' || newValue.toLowerCase() == 'false') {
                ServerSettings[serverId][setting] = (newValue == 'true');
                response = '`' + setting + ' = ' + ServerSettings[serverId][setting] + '`';
            } else {
                response = 'You need a true/false value';
            }
        } else

        if (typeof ServerSettings[serverId][setting] === 'number') {
            if (!isNaN(parseInt(newValue, 10))) {
                ServerSettings[serverId][setting] = (parseInt(newValue, 10));
                response = '`' + setting + ' = ' + ServerSettings[serverId][setting] + '`';
            } else {
                response = 'You need a number';
            }
        }

    } else if (ServerSettings[serverId].memes[setting] !== undefined) {

        if (newValue.toLowerCase() == 'true' || newValue.toLowerCase() == 'false') {
            ServerSettings[serverId].memes[setting] = (newValue == 'true');
            response = '`' + setting + ' = ' + ServerSettings[serverId].memes[setting] + '`';
        } else {
            response = 'You need a true/false value';
        }

    } else {
        response = '`No setting was found.`';
    }

    fs.writeFile('./serverSettings.json', JSON.stringify(ServerSettings, null, 4), function (err) {
        if (err) {
            console.log(err + '\n===\nError while creating settings');
        } else {
            console.log('Settings Created');
        }
    });

    return response;
}

function createServerSettings(serverId) {
    if (ServerSettings[serverId] === undefined) {
        console.log('Server has no settings, creating settings for: ' + serverId);
        ServerSettings[serverId] = Settings;

        ServerSettings[serverId].hidden.cleverBot = new Cleverbot();

        fs.writeFile('./serverSettings.json', JSON.stringify(ServerSettings, null, 4), function (err) {
            if (err) {
                console.log(err + '\n===\nError while creating settings');
            } else {
                console.log('Settings Created');
            }
        });
    }
}

function userHasPermission(server, user, permisssion) {
  console.log('===');

  if (serverId.beginsWith('dm')) return true; //DMs don't need no server manager!

  var roles = server.detailsOfUser(user).roles; //Array of roles

  var hasRole = false;

  for (var roleIndex = 0; roleIndex < roles.length; roleIndex++) {
      if (roles[roleIndex].hasPermission(permisssion)) {
          hasRole = true;
      }
  }

  console.log(user.username + ' in server ' + server.name + ' has permission ' + permisssion + ': ' + hasRole);

  return hasRole;
}
//Login stuff

if (Auth.token !== '') {
  console.log('Logged in with token!');
  robotOtter.loginWithToken(Auth.token);

} else if (Auth.email !== '' && Auth.password !== '') {
  robotOtter.login(Auth.email, Auth.password, function (error, token) {
    console.log('Logged in with email + pass!');
    Auth.token = token;

    fs.writeFile('./auth.json', JSON.stringify(Auth, null, 4), function(err) {
      if(err) {
        console.log(err + '\n===\nError while saving token');
      } else {
        console.log('Token saved');
      }
    });

  });
} else {
  console.log('No authentication details found!');
  process.exit(1);
}

//Graceful exit (Like a whale)
process.stdin.resume();

process.on('SIGINT', function() {
    robotOtter.logout();
    exitRobotOtter();
});

function exitRobotOtter() {
    robotOtter.logout();
    console.log('\n=-=-=-=-=-=-=-=' +
                '\nLogged out.');
    process.exit(1);
}

//not 1k yet, still hope for sanity!
