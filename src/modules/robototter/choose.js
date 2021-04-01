// pick things
module.exports.config = {
  name: 'choose',
  invokers: ['choose from', 'choose', 'pick'],
  help: 'Picks from a list',
  expandedHelp:
    "For when you can't decide.\nThings with spaces should be surrounded in quotes, \"like this\" or 'like this'.",
  usage: [
    'Choose a thing',
    'pick thing "another thing" meme',
    'Choose some more',
    'pick one_word "multiple words here", one_again',
  ],
}

const responsesNoChoices = [
  'I pick... Nothing',
  "You didn't give me anything to pick",
  'Nice try',
  'I love the void as well',
  'Hmm... What *do* I pick?',
  "Don't give me too many choices now",
  '\u{1f612}',
  "Error! Cannot read property `choices` of--I'm joking",
  'Ha, ha. Very funny.',
]

const responsesOneChoice = [
  'Really?',
  '...Really?',
  'Why',
  'I think you can decide yourself',
  'I need more than one thing to pick from',
  "You don't need me to choose",
  'I pick the only thing I can pick',
  "I'll let you decide",
  'Go bother Smol with that',
  'Why are you like this',
]

const responses = [
  'I pick',
  'Hmm...',
  'Uh, how about',
  'Obviously',
  'Ooh!',
  'Tough one... ',
  'Meme?',
  '->',
  'The rng tells me',
  'Smol said',
  'Bulba likes',
  'Booru picked',
  'I like',
  'o',
  'Beep Boop',
]

module.exports.events = {}
module.exports.events.message = (bot, message) => {
  const [cmd, ...choices] = bot.sleet.shlex(message)
  const prefix =
    (message.member ? message.member.displayName : message.author.username) +
    ', '

  if (choices.length === 0)
    return message.channel.send(prefix + choose(responsesNoChoices))

  if (choices.length === 1)
    return message.channel.send(prefix + choose(responsesOneChoice))

  message.channel.send(
    prefix + choose(responses) + ' **' + choose(choices) + '**!',
  )
}

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
