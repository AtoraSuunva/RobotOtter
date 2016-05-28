# RobotOtter
Discord chatbot for rolling dice &amp; flipping coins. Also some other features for /r/OtterDnD

# How to use
0. Install [Node.js](https://nodejs.org/en/download/)
1. Install [discord.js](http://discordjs.readthedocs.org/en/latest/installing.html).
2. Download/Pull RobotOtter (Obviously) and extract it.
3. Create a Discord account (If you haven't already).
4. Join the channels you want to use the bot on.
5. Fill out 'email' and 'password' in authExample.json.
6. Rename it to auth.json.
7. Run in command line `node RobotOtter.js` while in the installation folder.

If that doesn't work it's probably my fault.

# Commands

Arguments between **{Curly Braces}** are **required**, while those between [Brackets] are optional.

## !roll {times}d{sides}[+-*/]{times}d{sides} OR {modifier}
Rolls a dice. Follows [dice notation](https://en.wikipedia.org/wiki/Dice_notation).

**{times}: Number of dice rolls (max. 10, default 1.)**

**{dice}: Number of sides per die (max. 256)**

[+-/*]: (Monster) math operator to use.

[modifier]: Number to modify the roll by.

*Example: !roll 2d20 =>*

    {8} + {14} 
    = 22

*!roll d20-d3 =>*

    {8} = (8) - [1]
    = 7

## !flip [times]
Flips a coin.

[times]: Number of coin flips (max. 10)

*Example: !flip 2 =>*

    {T} + {H} = [H = 1] : [T = 1]

## !choose {item1, item2, ...itemN}
Chooses an item from a comma-delimited list of them.

{itemN}: Anything you want, as long as it doesn't have a `,`

*Example: !choose hello, world,localhost:8080 =>*

    -> world

## !wiki [page]
*Subreddit mode only*

Shows the wiki or a page on the wiki.

[page]: Page name to show:

    items, quests, players, locations

*Example: !wiki players =>*

   `https:/reddit.com/r/OtterDnD/wiki/players`


## !help [command]
Brings a help menu or help for a specific command.

[command]: The command to show help for.

*Example: !help flip =>*

    Formatting: !flip {times} 
    {times}: Number of coin flips (max. 10)
    Example: !flip 2 => {T} + {H} = [H = 1] : [T = 1]

# Settings

## "maxDiceTimes"
`Default: 10`

The max amount of times you can roll a dice in one command.
High values such as 100000 **will** cause RobotOtter to stop responding while it rolls 100000 dice (Trust me).

## "maxDiceSides"
`Default: 256`

The maximum amount of sides a die can have.

## "maxModifier"
`Default: 1000`

The maximum number you can modify (add, substract, multiply, divide) by.

## "maxCoinFlips"
`Default: 10`

Maximum amount of times you can flip a coin in one command.
Probably has the same problem as `!roll` where *really* high values cause it to stop responding.

## "subreddit"
`Default: false`

You probably don't need to change this unless you want to use !wiki for some reason.

## "wew"
`Default: false`

wew lad

## License
i dunno i have no idea what each license does so i'll just leave this with no license.

So do whatever you want with this, copy it, print it, make art with it. Just give me credit because not doing so is immoral.