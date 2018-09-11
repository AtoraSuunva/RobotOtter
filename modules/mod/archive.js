module.exports.config = {
  name: 'archive',
  invokers: ['archive'],
  help: 'Archives stuff',
  expandedHelp:'Archives messages and then uploads as a gist.\nArchives 100 messages by default.',
  usage: ['Archive 100 messages', 'archive', 'Archive 50 messages', 'archive 50'],
  invisible: true
}

const Discord = require('discord.js')

module.exports.events = {}
module.exports.events.message = async (bot, message) => {
  const [cmd, limit = 100] = bot.sleet.shlex(message)

  if (limit < 1)
    return message.channel.send('I cannot archive less than 1 message')

  if (Number.isNaN(+limit))
    return message.channel.send('`limit` should be a number')

  const messages = await getMessages(message.channel, limit)
  const users = new Set(messages.array().map(m => m.author))

  let txt = `[${message.guild ? message.guild.name : 'DM'} (${message.guild ? message.guild.id : message.author.id}); `
          + (message.channel.name ? `#${message.channel.name}` : `@{message.author.tag}`) + `(${message.channel.id})]\n`
          + `[${Array.from(users).map(u => u.tag + ' (' + u.id + ')').join('; ')}]\n\n`

  for (const msg of messages.array()) {
    txt += messageToLog(msg) + '\n'
  }

  const filename = `${message.channel.name || message.author.tag}.dlog.txt`
  const gist = await bot.sleet.createGist(txt, {filename})

  message.channel.send(`Archived: ${messages.size} messages\n${gist.body.html_url}`)
}

async function getMessages(channel, limit) {
   let messages = new Discord.Collection()

   while (messages.size < limit) {
     const fetchLimit = limit - messages.size < 100 ? limit - messages.size : 100

     const newMessages = await channel.fetchMessages({limit: fetchLimit,
                                 before: messages.first() ? messages.first().id : undefined})

     messages = messages.concat(newMessages)
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp)

     if (newMessages.size < 100) break

     await sleep(500) // Avoid spamming discord completely
   }

   return messages
}

function messageToLog(message) {
  return `[${curTime()}] (${message.id}) ` +
           `${message.author.username}: ${message.cleanContent}` +
           `${(message.attachments.first() !== undefined) ? ' | Attach: ' + message.attachments.array().map(a=>a.url).join(', ') : ''}`
}

function curTime(date) {
  date = date || new Date()
  return `${padLeft(date.getMonth()+1,2,0)}/${padLeft(date.getDate(),2,0)} ${padLeft(date.getHours(),2,0)}:${padLeft(date.getMinutes(),2,0)}`
}

function padLeft(msg, pad, padChar = '0') {
  padChar = '' + padChar
  msg = '' + msg
  let padded = padChar.repeat(pad)
  return padded.substring(0, padded.length - msg.length) + msg
}

function sleep(time) {
  return new Promise(r => setTimeout(r, time))
}

function timeSince(date) {
    let seconds = Math.floor(((new Date().getTime()/1000) - date)),
    interval = Math.floor(seconds / 31536000)

    if (interval > 1) return interval + ' year' + (interval === 1) ? '' : 's'

    interval = Math.floor(seconds / 2592000)
    if (interval > 1) return interval + ' month' + (interval === 1) ? '' : 's'

    interval = Math.floor(seconds / 86400)
    if (interval >= 1) return interval + ' day' + (interval === 1) ? '' : 's'

    interval = Math.floor(seconds / 3600)
    if (interval >= 1) return interval + ' hour' + (interval === 1) ? '' : 's'

    interval = Math.floor(seconds / 60)
    if (interval > 1) return interval + ' minute' + (interval === 1) ? '' : 's'

    return Math.floor(seconds) + ' second' + (seconds === 1) ? '' : 's'
}
