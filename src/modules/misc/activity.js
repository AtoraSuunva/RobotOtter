//set a random playing game every X whatever
module.exports.config = {
  name: 'activity',
  invokers: ['activity'],
  help: 'Allows to randomly/manually set an activity',
  expandedHelp:
    'Format is `{TYPE} ACTIVITY MESSAGE`\nPLAYING, STREAMING, LISTENING, WATCHING\nBot owner only.',
  usage: [
    'Random one',
    'activity',
    'Manual',
    'activity something blah',
    'Manual and custom',
    '{streaming} the bee movie',
  ],
  invisible: true,
}

const statuses = [
  'with rocks!',
  '{streaming} a stream!',
  'send nudes',
  '{streaming} otter power!',
  '*chirp*',
  '*purr*',
  '*squeal*',
  '*gurgling*',
  '{streaming} pawholding~!',
  '{streaming} some motterating',
  'alone',
  'with Atlas!',
  'with Smol Bot!',
  'with BulbaTrivia!',
  "with Haram-- wait he's dead",
  'with Dito!',
  'probably something lewd',
  'aaa',
  'with shit code.',
  '{streaming} the entire bee movie',
  'with clams!',
  'otters are adorable',
  '{streaming} memes.',
  '{streaming} Atlas Dying.',
  'Lich Quest!',
  'Avy by Hannahchomp, thanks!',
  '{streaming} Jolt hugs!',
  '{streaming} the Twitch logout page.',
  '{streaming} Playing',
  'Streaming',
  'send dudes',
  '{streaming} Atlas crying while debugging',
  '*otter noises*',
  'as an Ottermancer',
  'as a Seal',
  'as a Chicken',
  'rip lich quest',
  'in Otter Space',
  'hjkasd otters are adorable',
  'Otters, Dungeons & Dragons',
  'in the snow!',
  '{listening} a calming stream',
  '{watching} a fight between Smol and Bulba',
  '{watching} the fishies',
  '{watching} chat',
  '{listening} a waterfall',
  '{watching} maymays',
  'with other otters :3c',
  '{listening} the start of the robo-revolution',
  '{watching} ass',
]

//strings starting with '{streaming}' will be shown as "Streaming X"
const appendMsg = ' | r?help' //use this to keep a constant message after
const interval = 60 * 15 //in seconds
const twitch = 'https://twitch.tv/logout' //memes
let interv

module.exports.events = {}

module.exports.events.ready = bot => {
  bot.user.setActivity(...getPlaying())
  interv = setInterval(
    () => bot.user.setActivity(...getPlaying()),
    interval * 1000,
  )
}

module.exports.events.init = (sleet, bot) => {
  if (bot && bot.readyAt) {
    module.exports.events.ready(bot)
  }
}

module.exports.events.message = (bot, message) => {
  if (message.author.id !== bot.sleet.config.owner.id)
    return message.channel.send('Nah, how about I do what I want.')

  let [cmd, ...playing] = bot.sleet.shlex(message)
  playing = playing.join(' ')

  let activity = playing ? getPlayingFrom(playing) : getPlaying()

  bot.user.setActivity(...activity)

  if (playing) {
    clearInterval(interv)
  } else {
    interv = setInterval(
      () => bot.user.setActivity(...getPlaying()),
      interval * 1000,
    )
  }

  bot.user.setActivity(...activity)

  message.channel.send(
    `Now *${activity[1].type.toLowerCase()}* **${activity[0]}**`,
  )
}

function getPlaying() {
  return getPlayingFrom(randomChoice(statuses), true)
}

// Returns [name, {url, type}]
function getPlayingFrom(str, append = false) {
  let choice = str.match(/(?:{(\w+)})?(.*)/)

  let name = (choice[2] + (append ? appendMsg : '')).trim()
  let type = (choice[1] || 'PLAYING').toUpperCase()
  let url = type === 'STREAMING' ? twitch : undefined

  return [name, { url, type }]
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
