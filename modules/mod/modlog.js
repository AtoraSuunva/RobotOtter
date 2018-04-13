module.exports.config = {
  name: 'modlog',
  invokers: null,
  help: 'logs shit',
  expandedHelp:'WHOA LOFS',
  invisible: true,
  autoLoad: false
}

// this is broken for now

const Discord = require('discord.js')

module.exports.events = {}
module.exports.events.guildMemberAdd = async (bot, member) => {
  if (member.guild.id !== '120330239996854274') return

  let embed = new Discord.RichEmbed()
    .setDescription(`✨ Member Join: **${Discord.Util.escapeMarkdown(member.user.username)}**#${member.user.discriminator} (${member.user.id})\nThis server now has ${member.guild.members.size} members`)
    .setTimestamp(new Date().now)
    .setColor('#ffff66')

  member.guild.channels.get('235012165147295744').send({embed})
}


module.exports.events.guildMemberRemove = async (bot, member) => {
  if (member.guild.id !== '120330239996854274') return

  let latestKick = await member.guild.fetchAuditLogs({type: 'MEMBER_KICK', limit: 1})
  latestKick = latestKick.entries.first()
  let kickedBy

  if (latestKick.target.id === member.user.id)
   kickedBy = latestKick.executor

  let embed = new Discord.RichEmbed()
    .setDescription(`🚪 Member Remove: **${Discord.Util.escapeMarkdown(member.user.username)}**#${member.user.discriminator} (${member.user.id})
This server now has ${member.guild.members.size} members
This user joined ${timeSince(member.joinedTimestamp)} ago`
+ ((kickedBy !== undefined) ? `\nAnd was kicked by **${kickedBy.tag}** for "${latestKick.reason}"` : ''))
    .setTimestamp(new Date().now)
    .setColor('#996600')

  member.guild.channels.get('235012165147295744').send({embed})
}

module.exports.events.guildMemberUpdate = async (bot, oldMember, newMember) => {
  if (oldMember.guild.id !== '120330239996854274') return

  if (oldMember.user.username === newMember.user.username) return

  let embed = new Discord.RichEmbed()
    .setDescription(`👥 Member Username Changed: **${Discord.Util.escapeMarkdown(oldMember.user.username)}**#${oldMember.user.discriminator} (${oldMember.user.id})\nNow **${Discord.Util.escapeMarkdown(newMember.user.username)}**`)
    .setTimestamp(new Date().now)
    .setColor('#999999')

  member.guild.channels.get('235012165147295744').send({embed})
}

module.exports.events.ready = (bot) => {
  bot.guilds.get('120330239996854274').fetchMembers()
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
