module.exports.config = {
  name: 'ban',
  invokers: ['ban', 'xban', 'begone', 'omae wa mou shindeiru', 'vore'],
  help: 'Bans people',
  expandedHelp: 'does the bann',
  usage: ['Ban someone', 'ban [@user]', 'Ban another person', 'ban [user id]', 'Ban, but with reason', 'ban @user u suck']
}

const Discord = require('discord.js')

module.exports.events = {}
module.exports.events.message = async (bot, message) => {
  if (!message.guild) return

  if (!message.guild.me.permissions.has('BAN_MEMBERS'))
    return message.channel.send('I do not have ban permissions.')

  if (!message.member.permissions.has('BAN_MEMBERS'))
    return message.channel.send('You do not have ban permissions.')

  let [cmd, user, ...reason] = bot.sleet.shlex(message, {invokers: module.exports.config.invokers})
  reason = reason.join(' ')

  if (!user)
    return message.channel.send('So, who do you want to ban?')

  let id = user.match(/<@!?(\d+)>/)
  if (id) user = id[1]

  if (user === bot.user.id)
    return message.channel.send('I am not banning myself.')

  if (user === message.author.id)
    return message.channel.send('I am not letting you ban yourself.')

  const member = await fetchMember(message.guild, user)

  if (member !== null && member.highestRole.position >= message.member.highestRole.position)
    return message.channel.send(`${member.user.tag} is higher or equal to you.`)

  if (member !== null && member.highestRole.position >= message.guild.me.highestRole.position)
    return message.channel.send(`${member.user.tag} is higher or equal to *me*.`)

  if (+user !== +user)
    return message.channel.send('That is not a valid user to ban.')

  if ((await message.guild.fetchBans()).get(user))
    return message.channel.send('That user is already banned.')

  message.guild.ban(user, {reason: reason + (reason ? ' ' : '') + `[Ban by ${message.author.tag}]`})
    .then(async uID => {
      const u = (await message.guild.fetchBans()).get(user)

      message.channel.send(`I have banned ${formatUserTag(u)}.`)
    })
    .catch(e => message.channel.send('There was an error while trying to ban that user.\n`' + e + '`'))
}

function fetchMember(guild, user) {
  return new Promise(r => guild.fetchMember(user)
           .then(m => r(m))
           .catch(e => r(null))
         )
}

function formatUserTag(user) {
  return `**${Discord.Util.escapeMarkdown(user.username)}**\u{200e}#${user.discriminator}${user.bot ? botTag || ' [BOT]' : ''}`

}
