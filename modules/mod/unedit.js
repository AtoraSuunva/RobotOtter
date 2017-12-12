module.exports.config = {
  name: 'unedit',
  invokers: ['unedit'],
  help: 'Posts all the versions of a message',
  expandedHelp: 'Unedits a message in the current channel.\nLocked to "Manage Messages".',
  usage: ['Unedit in current channel', 'unedit <message id>', 'Unedit in other channel', 'unedit <message id> [channel id|#channel]'],
  invisible: true
}

module.exports.events = {}
module.exports.events.message = async (bot, message) => {
  if (!message.guild) return
  if (message.author.id !== bot.modules.config.owner.id
      && !message.channel.permissionsFor(message.author).has('MANAGE_MESSAGES')) return

  let [cmd, msg, channel] = bot.modules.shlex(message)
  channel = (channel) ? message.guild.channels.get(channel.replace(/[<>#]/g, '')) : message.channel

  if (!channel) return message.channel.send('Could not find that channel.')

  try {
    msg = await channel.fetchMessage(msg)
  } catch (e) {
    return message.channel.send('Failed to fetch that message.\nTry `r?unedit ' + msg + ' [#channel]`')
  }

  if (!msg) return message.channel.send('Could not find that message')

  message.channel.send('"' + msg.edits.reverse().map(m => m.content).join('",\n"') + '"', {code: 'js'})
}
