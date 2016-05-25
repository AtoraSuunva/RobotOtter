var Discord = require('discord.js');
var Auth = require('./auth.json');

//Variables!
var helpRegex = /!help (\w+)/; //get command name
var wikiRegex = /!wiki (\w+)/; //get page name
var numberRegex = /(\d+)/;     //get number
var diceRegex = /(\d+)?d(\d+)([-+*/])?(\d+)?d?(\d+)?/; //get numbers from dice string 1d3+5d6 => ['1d3+5d6', '1', '3', '+', '5', '6']
                                                         //                           4d5     => ['4d5'    , '4', '5', undefined, undefined, undefined]

var robotOtter = new Discord.Client();

robotOtter.on('message', function (message) { //switch is for the weak
    if (message.content.beginsWith('!help')) {
        help(message, message.content);
    }

    if (message.content.beginsWith('!roll')) {
        roll(message, message.content);
    }

    if (message.content.beginsWith('!flip')) {
        flip(message, message.content);
    }
    
    if (message.content.beginsWith('!choose')) {
        choose(message, message.content);
    }

    if (message.content.beginsWith('!wiki')) {
        wiki(message, message.content);
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
            helpText = '\n' + 'Formatting: !roll {times}d{dice} ' +
                       '\n' + '{times}: Number of dice rolls (max. 10)' +
                       '\n' + '{dice}: Number of sides per die (max. 256)' +
                       '\n' + 'Example: !roll 2d20 => {8} + {14} = 22';
            break;

        case 'flip':
            helpText = '\n' + 'Formatting: !flip {times} ' +
                       '\n' + '{times}: Number of coin flips (max. 10)' +
                       '\n' + 'Example: !coin 2 => {T} + {H} = [H = 1] : [T = 1]';
            break;

        case 'wiki':
            helpText = '\n' + 'Formatting: !wiki [page] ' +
                       '\n' + '[page]: Page name to show: ' +
                       '\n' + '[items, quests, players, locations]' +
                       '\n' + 'Example: !wiki players => /r/OtterDnD/wiki/players';
            break;

        case 'help':
            helpText = 'Congrats! You mastered !help';
            break;

        default:
            helpText = '\n' + '!help [command] - Brings this help menu or help for a specific command.' +
                       '\n' + '!roll {times}d{dice} - Flips a coin {# of flips} times.' +
                       '\n' + '!flip {times} - Filps a coin {# of flips} times.' +
                       '\n' + '!wiki [page] - Link to the OtterDnD wiki, or link directly to [page] (ie. location, players).' +
                       '\n' + '{Required} - [Optional]';
    }

    robotOtter.reply(message, helpText);
    console.log('------');
}

function roll(message, msgTxt) {
    console.log('Roll ' + msgTxt + '!');
    var match = msgTxt.match(diceRegex);
    if (match === null) match = ['1d20', 1, 20];
    var times        = ((Number.isSafeInteger(parseInt(match[1], 10))) ? parseInt(match[1], 10) : 1 ); //gotta be safe
    var diceSize     = ((Number.isSafeInteger(parseInt(match[2], 10))) ? parseInt(match[2], 10) : 20); //defaults to 1d20
    var symbol       = ((match[3] !== undefined)                       ?          match[3]      : ''); //defaults to empty
    var times2       = ((Number.isSafeInteger(parseInt(match[4], 10))) ? parseInt(match[4], 10) : ''); //defaults to empty
    var diceSize2    = ((Number.isSafeInteger(parseInt(match[5], 10))) ? parseInt(match[5], 10) : ''); //defaults to empty

    if (times > 10 || diceSize > 256) {
        robotOtter.reply(message, 'Roll Invalid! Max {Times} is 10. Max {Dice} is 256.');
        return;
    }

    if (times <= 0 || diceSize <= 0) {
        robotOtter.reply(message, 'Roll Invalid! {Times} or {Dice} negative or 0.');
        return;
    }

    console.log('match    : ' + '[' + match + ']');
    console.log('times    : ' + times);
    console.log('diceSize : ' + diceSize);
    console.log('symbol   : ' + symbol);
    console.log('times2   : ' + times2);
    console.log('diceSize2: ' + diceSize2);
    console.log('-----');

    var diceString = '';
    var diceTotal = 0;
    var currentRoll = 0;

    for (i = times; i > 0; i--) {
        currentRoll = rollDice(diceSize);
        diceTotal += currentRoll;
        diceString += '{' + currentRoll + ((i === 1) ? '} ' : '} + ');

        console.log(currentRoll);
        console.log(i);
        console.log(diceString);
        console.log(diceTotal);
    }

    console.log('-----')

    if (symbol !== '' && ((times2 !== '') || (diceSize2 !== ''))) {
        diceString += '= (' + diceTotal + ') ' + symbol + ' [';

        if (times2 !== '' && diceSize2 === '') {
            diceTotal = parseEquation(diceTotal, symbol, times2);
            diceString += times2;
        }else {
            var diceTotal2 = 0;
            var times2 = ((times2 !== '') ? times2 : 1);

            for (i = times2; i > 0; i--) {
                diceTotal2 += rollDice(diceSize2);
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

    if (diceSize === 1) {
        robotOtter.reply(message, 'Seriously, what did you expect?');
    }

    console.log('-----');
}

function flip(message, msgTxt) {
    console.log('Coin Flip ' + msgTxt + '!');
    var match = msgTxt.match(numberRegex);
    if (match === null) match = [1];
    var times = ((Number.isSafeInteger(parseInt(match[0], 10))) ? parseInt(match[0], 10) : 1); //gotta be safe

    if (times > 10) {
        robotOtter.reply(message, 'Flip Invalid! Max {Times} is 10.');
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
  var choices = msgText.replace(/(\s*,\s*)/g, ',').substring(8).split(',');
  robotOtter.reply(message, choices[Math.floor(Math.random()*choices.length)]); 
  //Sometimes you need to be concise
  //Because nobody else will see your code :(
  //But maybe that's a good thing :)
  console.log('-----')
}

function wiki(message, msgText) {
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

if (Auth.token !== '') {
    robotOtter.loginWithToken(Auth.token);
}else if (Auth.email !== '' && Auth.password !== '') {
    robotOtter.login(Auth.email, Auth.password, function (error, token) {
        console.log(error);
        Auth.token = token;
    });
} else {
    console.log('No authentication details found!');
}
