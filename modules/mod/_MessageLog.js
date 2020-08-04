module.exports = (messages) => {
  const message = messages.first()
  const users = new Set(messages.array().map(m => m.author))
  const channels = extractMentions(messages, 'channels')
  const roles = extractMentions(messages, 'roles')
  const userMentions = extractMentions(messages, 'users')

  let txt = `[${message.guild ? message.guild.name : 'DM'} (${message.guild ? message.guild.id : message.author.id}); `
          + (message.channel.name ? `#${message.channel.name}` : `@{message.author.tag}`) + `(${message.channel.id})]\n`
          + mentionArray(users, 'tag')
          + mentionArray(userMentions, 'tag')
          + mentionArray(channels, 'name')
          + mentionArray(roles, 'name') + '\n'

  for (let m of messages.array())
    txt += messageToLog(m)

  return txt
}

function messageToLog(message) {
  return `[${curTime()}] (${message.id}) ` +
           `${message.author.tag} : ${message.content}` +
           `${(message.attachments.first() !== undefined) ? ' | Attach: ' + message.attachments.array().map(a=>a.url).join(', ') : ''}\n`
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

function extractMentions(messages, type) {
  const set = new Set()
  messages.array().forEach(m => m.mentions[type].array().forEach(c => set.add(c)))
  return set
}

function mentionArray(set, name) {
  return `[${Array.from(set).map(s => s[name] + ' (' + s.id + ')').join('; ')}]\n`
}
