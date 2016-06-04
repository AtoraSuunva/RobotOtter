var Discord = require('discord.js'); //Handles the API
var Auth = require('./auth.json'); //Auth details
var Settings = require('./settings.json'); //i have no idea
var Puns = require('./puns.json'); //So many cat puns you'll be cat-atonic!
var fs = require('fs'); //rw functionality

var commandSymbol = ((Settings.commandSymbol !== undefined)        ? Settings.commandSymbol : '!');
var maxDiceTimes  = ((Number.isSafeInteger(Settings.maxDiceTimes)) ? Settings.maxDiceTimes  :  10);
var maxDiceSides  = ((Number.isSafeInteger(Settings.maxDiceSides)) ? Settings.maxDiceSides  : 256);
var maxModifier   = ((Number.isSafeInteger(Settings.maxModifier))  ? Settings.maxModifier   : 256);
var maxCoinFlips  = ((Number.isSafeInteger(Settings.maxCoinFlips)) ? Settings.maxCoinFlips  :  10);

var subreddit = ((typeof Settings.subreddit === 'boolean') ? Settings.subreddit : false);
var memes = ((typeof Settings.memes === 'boolean') ? Settings.memes : false); //lad

//The use of the terniary operator is to check each setting to ensure it's (somewhat) correct.
//A 'maxDiceSides' of 'apple' is useless
//So if the setting is invalid, we default to settings that work.

//Variables!
var helpRegex = /help (\w+)/;
var wikiRegex = /wiki (\w+)/;
var punRegex  = /pun (\w+)/;
var numberRegex = /(\d+)/;     //get number
var diceRegex = /(\d+)?d(\d+)([-+*/])?(\d+)?d?(\d+)?/; //get numbers from dice string 1d3+5d6 => ['1d3+5d6', '1', '3', '+', '5', '6']
                                                         //                           4d5     => ['4d5'    , '4', '5', undefined, undefined, undefined]

    
console.log('Current Settings:' +
            '\n' + 'commandSymbol: ' + commandSymbol +
            '\n' + 'maxDiceTimes : ' + maxDiceTimes +
            '\n' + 'maxDiceSides : ' + maxDiceSides +
            '\n' + 'maxModifier  : ' + maxModifier +
            '\n' + 'maxCoinFlips : ' + maxCoinFlips +
            '\n' + 'subreddit    : ' + subreddit +
            '\n' + 'memes        : ' + memes + 
            '\n\n' + 'If any settings are different than the ones in settings.json, then you incorrectly entered them.' + '\n');

var robotOtter = new Discord.Client();

robotOtter.userAgent.url = "https://github.com/AtlasTheBot/RobotOtter-Discord";
robotOtter.userAgent.version = "0.9.2";

robotOtter.on("ready", function () {
	console.log('My body is ready! Memeing in: \n' + 
                robotOtter.servers.length + ' servers,\n' +
                robotOtter.channels.length + ' channels.');
                
    robotOtter.setPlayingGame(commandSymbol + 'help | goo.gl/nNpZYR');
});

robotOtter.on('message', function (message) { //switch is for the weak
    if (message.author.equals(robotOtter.user)) return; //Don't reply to itself
    
    if (message.content.beginsWith(commandSymbol + 'help')) {
        help(message, message.content);
    }

    if (message.content.beginsWith(commandSymbol + 'roll')) {
        roll(message, message.content);
    }

    if (message.content.beginsWith(commandSymbol + 'flip')) {
        flip(message, message.content);
    }
    
    if (message.content.beginsWith(commandSymbol + 'choose')) {
        choose(message, message.content);
    }
    
    if (message.content.beginsWith(commandSymbol + 'pun')) {
        pun(message, message.content);
    }
    
    if (message.content.beginsWith(commandSymbol + 'stats')) {
        stats(message, message.content);
    }

    if (message.content.beginsWith(commandSymbol + 'wiki')) {
        wiki(message, message.content);
    }
    
    if(message.content.toLowerCase().includes('wew') && !message.content.toLowerCase().includes('lad') && memes) { //wew lad
        robotOtter.sendMessage(message.channel, 'lad');
    }
    
    if(message.content.toLowerCase().includes('ayy') && !message.content.toLowerCase().includes('lmao') && memes) { //wew lad
        if (message.content.toLowerCase().includes('lmoa')) {
            robotOtter.sendMessage(message.channel, '*lmao');
        } else {
            robotOtter.sendMessage(message.channel, 'lmao');
        }
    }

    if (message.content === 'Cat.' && memes) { //Cat.
        robotOtter.sendMessage(message.channel, 'Cat.');
    }

    if (message.content.includes(':(') && memes) { //Don't be sad!
        robotOtter.sendMessage(message.channel, ':)');
    }

    if ((message.content.includes('kms') || message.content.toLowerCase().includes('kill myself')) && memes) { //don't do it
        robotOtter.sendMessage(message.channel, 'http://www.suicidepreventionlifeline.org/');
    }

    if ((message.content.includes('kys') || message.content.toLowerCase().includes('kill yourself')) && memes) { //rude
        robotOtter.sendMessage(message.channel, 'Wow rude.');
    }

    if (message.content.beginsWith(commandSymbol + 'wakeup') && memes) { //WAKE ME UP INSIDE
        robotOtter.sendMessage(message.channel, 'CAN\'T WAKE UP.');
    }
    
    if ((message.content.includes('fuck') || message.content.includes('bitch') || message.content.includes('shit')) && memes) { //WAKE ME UP INSIDE
        robotOtter.sendMessage(message.channel, 'This is a family friendly chat, don\'t you ever fucking swear again.');
    }
});

function help(message, msgTxt) {
    console.log('Help! ')
    var commandName = ((msgTxt.match(helpRegex) !== null) ? msgTxt.match(helpRegex) : ['no', 'match', ':('] );

    console.log(msgTxt);
    console.log(commandName);

    var helpText = '';

    switch (commandName[1].toLowerCase()) {
        case 'roll':
            helpText = '\n' + 'Formatting: ' + commandSymbol + 'roll {times}d{sides}[+-*/]{times}d{sides} OR {modifier} ' +
                       '\n' + '{times}: Number of dice rolls (max. ' + maxDiceTimes + ')' +
                       '\n' + '{sides}: Number of sides per die (max. ' + maxDiceSides + ')' +
                       '\n' + '[+-*/]: (Monster) math operator to use' +
                       '\n' + '{modifier}: Number to modify the roll by' +
                       '\n' + 'Example: !roll 2d20 => {8} + {14} = 22';
            break;

        case 'flip':
            helpText = '\n' + 'Formatting: ' + commandSymbol + 'flip {times} ' +
                       '\n' + '{times}: Number of coin flips (max. ' + maxCoinFlips + ')' +
                       '\n' + 'Example: !flip 2 => {T} + {H} = [H = 1] : [T = 1]';
            break;

        case 'choose':
            helpText = '\n' + 'Formatting: ' + commandSymbol + 'choose {item1, item2,... itemN}' +
                       '\n' + '{itemN}: Items to select from' +
                       '\n' + 'Example: !choose yes, no => -> yes';
            break;
        
        case 'pun':
            helpText = '\n' + 'Formatting: ' + commandSymbol + 'pun {*cat*-egory}' +
                       '\n' + '{*cat*-egory}: Kind of puns' +
                       '\n' + 'Example: !pun cat => *Purr*fect = Perfect';
            break;
        
        case 'wiki':
            if (!subreddit) break; //no
            helpText = '\n' + 'Formatting: ' + commandSymbol + 'wiki [page] ' +
                       '\n' + '[page]: Page name to show: ' +
                       '\n' + '[items, quests, players, locations]' +
                       '\n' + 'Example: !wiki players => /r/OtterDnD/wiki/players';
            break;

        case 'help':
            helpText = 'Congrats! You mastered ' + commandSymbol + 'help';
            break;

        case 'me':
            helpText = 'It\'s too late, you cannot be saved.';
            break;

        default:
            helpText = '\n' + commandSymbol + 'help [command] - Brings this help menu or help for a specific command.' +
                       '\n' + commandSymbol + 'roll {times}d{dice} - Rolls a dice following the DnD style.' +
                       '\n' + commandSymbol + 'flip {times} - Filps a coin {# of flips} times.' +
                       '\n' + commandSymbol + 'choose {item1, item2,... itemN} - Chooses an item from a list.' +
                       '\n' + commandSymbol + 'pun {*cat*-egory} - Says a pun.' +
                       ((subreddit) ? ('\n' + commandSymbol + 'wiki [page] - Link to the OtterDnD wiki, or link directly to [page] (ie. location, players).') : ('')) +
                       '\n' + '{Required} - [Optional]';
    }

    robotOtter.reply(message, helpText);
    console.log('------');
}

function roll(message, msgTxt) {
    console.log('Roll ' + msgTxt + '!');
    var match = msgTxt.match(diceRegex);
    if (match === null) match = ['1d20', 1, 20];
    var times         = ((Number.isSafeInteger(parseInt(match[1], 10))) ? parseInt(match[1], 10) : 1 ); //gotta be safe
    var diceSides     = ((Number.isSafeInteger(parseInt(match[2], 10))) ? parseInt(match[2], 10) : 20); //defaults to 1d20
    var symbol        = ((match[3] !== undefined)                       ?          match[3]      : ''); //defaults to empty
    var times2        = ((Number.isSafeInteger(parseInt(match[4], 10))) ? parseInt(match[4], 10) : ''); //defaults to empty
    var diceSides2    = ((Number.isSafeInteger(parseInt(match[5], 10))) ? parseInt(match[5], 10) : ''); //defaults to empty

    if (times > maxDiceTimes || diceSides > maxDiceSides) {
        robotOtter.reply(message, 'Roll Invalid! Max {Times} is ' + maxDiceTimes + '. Max {Sides} is ' + maxDiceSides + '.');
        return;
    }

    if (times <= 0 || diceSides <= 0) { //Hardcoded because it's impossible to roll a dice 0 times, or a 0-sided die. Try it, I dare you.
        robotOtter.reply(message, 'Roll Invalid! {Times} or {Sides} negative or 0.');
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
        diceString += '{' + currentRoll + ((i === 1) ? '} ' : '} + ');

        console.log(currentRoll);
        console.log(i);
        console.log(diceString);
        console.log(diceTotal);
    }

    console.log('-----')

    if (symbol !== '' && ((times2 !== '') || (diceSides2 !== ''))) {
        diceString += '= (' + diceTotal + ') ' + symbol + ' [';

        if (times2 !== '' && diceSides2 === '') {
            if (times2 > maxModifier) {
                robotOtter.reply(message, 'Roll Invalid! Max {Modifier} is ' + maxModifier + '.');
                return;
            }
            diceTotal = parseEquation(diceTotal, symbol, times2);
            diceString += times2;
        }else {
            if (times2 > maxDiceTimes || diceSides2 > maxDiceSides) {
                robotOtter.reply(message, 'Roll Invalid! Max {Times} is ' + maxDiceTimes + '. Max {Sides} is ' + maxDiceSides + '.');
                return;
            }

            if (times2 <= 0 || diceSides2 <= 0) { //Hardcoded because it's impossible to roll a dice 0 times, or a 0-sided die.
                robotOtter.reply(message, 'Roll Invalid! {Times} or {Sides} negative or 0.');
                return;
            }
            
            var diceTotal2 = 0;
            var times2 = ((times2 !== '') ? times2 : 1);

            for (i = times2; i > 0; i--) {
                diceTotal2 += rollDice(diceSides2);
                console.log(i);
                console.log(diceTotal2);
            }
            diceTotal = parseEquation(diceTotal, symbol, diceTotal2);
            diceString += diceTotal2;
        }
        diceString += ']';
    }
    

    diceString += '\n' + '= ' + diceTotal;

    robotOtter.reply(message, diceString);

    if (diceSides === 1) {
        robotOtter.reply(message, 'Seriously, what did you expect?');
    }

    console.log('-----');
}

function flip(message, msgTxt) {
    console.log('Coin Flip ' + msgTxt + '!');
    var match = msgTxt.match(numberRegex);
    if (match === null) match = [1];
    var times = ((Number.isSafeInteger(parseInt(match[0], 10))) ? parseInt(match[0], 10) : 1); //gotta be safe

    if (times > maxCoinFlips) {
        robotOtter.reply(message, 'Flip Invalid! Max {Times} is ' + maxCoinFlips +'.');
        return;
    }

    var heads = 0; //1
    var tails = 0; //2
    var coinString = '';
    var currentFlip = 0;

    for (i = times; i > 0; i--) {
        currentFlip = rollDice(2);
        
        if (currentFlip === 1) {
            heads++;
        } else {
            tails++;
        }

        coinString += '{' + ((currentFlip === 1) ? 'H' : 'T' ) + ((i === 1) ? '} ' : '} + ');

        console.log(currentFlip);
        console.log(i);
        console.log(coinString);
        console.log('H = ' + heads);
        console.log('F = ' + tails);
    }

    coinString += '\n' + '= ' + '[H = ' + heads + '] : [' + 'T = ' + tails + ']';

    robotOtter.reply(message, coinString);
    console.log('-----');
}

function choose(message, msgText) {
  console.log('!choose')
  var choices = msgText.replace(/(\s*,\s*)/g, ',').substring(8).split(','); //.filter() ;^)
  choices = choices.filter(function(e) {return e !== '';}); //clear empty values (be glad it's not a one-liner)
  if (choices[0] !== undefined && choices.length > 1) {
    robotOtter.reply(message, '-> ' + choices[Math.floor(Math.random()*choices.length)]); 
  } else if (choices[0] !== undefined) {
    robotOtter.reply(message, '-> Really?');
  } else {
    robotOtter.reply(message, '-> Nothing, you gave me no choice. What did you expect?');
  }
  //Sometimes you need to be concise
  //Because nobody else will see your code :(
  //But maybe that's a good thing :)
  console.log('-----')
}

function pun(message, msgText) {
  console.log('!pun')
  var category = msgText.match(punRegex);
  category = category[1]; //regex pls
  
  console.log(category);
  
  if (Puns[category] !== undefined) {
    robotOtter.reply(message, Puns[category][Math.floor(Math.random() * Puns[category].length)]); 
  } else {
    robotOtter.reply(message, Puns['default'][Math.floor(Math.random() * Puns['default'].length)]);
  }
  console.log('-----')
}

function stats(message, msgText) {
    robotOtter.sendMessage(message.channel, 
                'Currently serving:' + '\n' +
                robotOtter.users + ' users,' + '\n' +
                robotOtter.channels + ' channels,' + '\n' +
                robotOtter.privateChannels + ' direct messages,' + '\n' +
                robotOtter.servers + ' servers.' + '\n' +
                'Up for: ' + msToTime(robotOtter.uptime)
                );
}

function wiki(message, msgText) {
    if (!subreddit) return;
    console.log('!Wiki ' + msgText);
    var page = msgText.match(wikiRegex);

    var match = ((page !== null) ? page[1].toLowerCase() : '');

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
            robotOtter.reply(message, 'Wiki: https://reddit.com/r/OtterDnD/wiki')
    }
    console.log('-----');
}

//EXTRA NON-COMMAND FUNCTIONS

String.prototype.beginsWith = function (string) {
    return (this.indexOf(string) === 0);
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
            console.log('Error in parseEquation()!')
    }
    return num1;
}

function msToTime(duration) {
    var seconds    = parseInt((duration/1000)%60)
        ,minutes    = parseInt((duration/(1000*60))%60)
        ,hours      = parseInt((duration/(1000*60*60))%24)
        ,days       = parseInt((duration/(1000*60*60*24)));

    var timeString = ((days >= 1)    ? ((days    > 1) ? days    + ' Days '   : days    + ' Day ')    : '') + 
                     ((hours >= 1)   ? ((hours   > 1) ? hours   + ' Hours '  : hours   + ' Hour ')   : '') + 
                     ((minutes >= 1) ? ((minutes > 1) ? minutes + ' Minutes ': minutes + ' Minutes '): '') + 
                     ((seconds >= 1) ? ((seconds > 1) ? seconds + ' Seconds' : seconds + ' Second')  : '');

    return timeString;
}

if (Auth.token !== '') {
  console.log('Logged in with token!');
  robotOtter.loginWithToken(Auth.token);
}else if (Auth.email !== '' && Auth.password !== '') {
  robotOtter.login(Auth.email, Auth.password, function (error, token) {
    console.log('Logged in with email + pass!');
    Auth.token = token;
    fs.writeFile('./auth.json', JSON.stringify(Auth, null, 4), function(err) {
      if(err) {
        console.log(err + ' - Error while saving token');
      } else {
        console.log('Token saved');
      }
    });
  });
} else {
    console.log('No authentication details found!');
}