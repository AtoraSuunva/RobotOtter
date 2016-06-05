# RobotOtter
Discord chatbot for rolling dice &amp; flipping coins. Also some other features for /r/OtterDnD

# Preview

Test it on Discord [here](https://discord.gg/0w6AYrrMIUfO71oV)!

# How to use

## Connect to Discord

Literally click 4 times.

0. Click [here](https://discordapp.com/oauth2/authorize?client_id=187027320714952704&scope=bot&permissions=0).
1. Select a server.
2. Authorize.
3. gg no re

## Manual Setup

If for some reason you want to host it yourself.

* Install [Node.js](https://nodejs.org/en/download/)
* Install [discord.js](http://discordjs.readthedocs.org/en/latest/installing.html).
* Download/Pull RobotOtter (Obviously) and extract it.

### Public Bot

See [here](https://discordapp.com/developers/docs/topics/oauth2#bot-vs-user-accounts), public bots *MUST* use a bot account, not a user account. Also gives the bot a sweet [BOT] tag.

* Register an app [here](https://discordapp.com/developers/applications/me).
* Create a bot user.
* Copy the token to `authExample.json`.

It should look like this:

    {
        "email": "Something@Here.Maybe",
        "password": "^^this tbh fam",
        "token": "longstringofrandomcharacters"
    }

* Rename `authExample.json` to `auth.json`.
* Read `Run`

### Private Bot

* Create a Discord account (If you haven't already).
* Join the channels you want to use the bot on.
* Fill out `email` and `password` in `authExample.json`.
* Rename it to `auth.json`. 
* Read `Run`.

### Run

* Run in command line `node RobotOtter.js` while in the installation folder.

If that doesn't work it's probably my fault because I suck at explaining.

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

## !pun {category}
Says a pun.

{category}: The kind of pun.

*Example: !pun cat =>*

    Purr-fect

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

## "commandSymbol"
`Default: "!"`

The symbol placed before commands. You should only change it if "!" conflicts with another bot.

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

## "memes"
`Default: false`

An array (list) of meme settings. Enable/Disable by changing each one to true/false.

## License
i dunno i have no idea what each license does so i'll just leave this with no license.

So do whatever you want with this, copy it, print it, make art with it. Just give me credit because not doing so is immoral.
