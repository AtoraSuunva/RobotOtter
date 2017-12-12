const rolebanCmds   = ['roleban', 'forebode', 'toss', 'defenestrate', 'shup']
const unRolebanCmds = ['unroleban', 'unforebode', 'untoss', 'refenestrate']

module.exports.config = {
  name: 'roleban',
  invokers: [...rolebanCmds, ...unRolebanCmds],
  help: 'Gives roles',
  expandedHelp: 'Locked to "manage roles", supports multiple users at once.\nYou can only roleban those lower than you.',
  usage: ['Roleban someone', 'roleban [@user|id]', 'Roleban more people', 'roleban [@user|id] [@user|id]', 'Unroleban', 'unroleban [@user|id]'],
  invisible: true
}

const roleNames = ['roleban', 'rolebanned', 'tossed', 'muted', 'foreboden', 'silenced']
const roleIds   = ['122150407806910464', '303723450747322388', '367873664118685697']
// r/ut, atlas yt, perfect
const mentionRegex = /<@!?[0-9]+>/
const rolebanned = new Map()
const logChannels = {'120330239996854274': '120337437456072704', '303720904968634368': '303721009423319041',
                     '211956704798048256': '290741331095977984', '255748349943087105': '272473114720468992'}
// r/ut, atlas yt, bepis, perfect
const {escapeMarkdown, Collection} = require('discord.js').Util

module.exports.events = {}
module.exports.events.message = async (bot, message) => {
  if (!message.guild)
    return
  if (!message.member.hasPermission('MANAGE_ROLES'))
    return message.channel.send('You need at least `Manage Roles`.')

  const [cmd, ...users] = bot.modules.shlex(message)
  const rbRole = getRolebanRole(message.guild)

  if (rbRole === null)
    return message.channel.send('I could not find a role to use, name a role one of: `' + roleNames.join('`, `') + '`.')

  if (message.member.highestRole.calculatedPosition < rbRole.calculatedPosition)
    return message.channel.send('Your highest role needs to higher than the `' + rbRole.name + '` role to (un)roleban.')

  let members = await extractMembers(users, message.guild)

  if (members.every(m => m === null))
    return message.channel.send('I got nobody to (un)roleban.')


  if (rolebanCmds.includes(cmd))
    roleban(bot, message, members, rbRole)
  else if (unRolebanCmds.includes(cmd))
    unroleban(bot, message, members, rbRole)

  // this should never be reached
}

function roleban(bot, message, members, rbRole) {
  for (let m of members) {
    if (m === null) continue
    if (m.roles.has(rbRole.id))
      message.channel.send(`${escapeMarkdown(m.user.tag)} is already rolebanned!`)

    let prevRoles = m.roles.filter(r => r.id !== message.guild.id)

    m.setRoles([rbRole], `[ Roleban by ${message.author.tag} ]`)
      .then(_ => {
        let msg = `**${escapeMarkdown(m.user.username)}**#${m.user.discriminator} has been rolebanned.` +
                  `\n**ID:** ${m.id}\n` +
                  '**Previous roles:** ' + (m.roles.size === 1 ? 'None.' :
                    '`' + prevRoles.array().map(r=>r.name).join('\`, \`') + '`')

        message.channel.send(msg)

        let logChannelId = logChannels[message.guild.id]
        if (logChannelId && message.channel.id !== logChannelId)
          message.guild.channels.get(logChannelId)
            .send(`**In:** ${message.channel}\n` + msg)

        rolebanned.set(m.id, prevRoles)
      })//.catch(_ => {
        //message.channel.send(`Failed to roleban ${m.user.tag}. Check my perms?\n${_}`)
        //bot.modules.reportError(_, 'roleban')
      //})
  }
}

function unroleban(bot, message, members, rbRole) {
  for (let m of members) {
    if (m === null) continue
    if (!m.roles.has(rbRole.id))
      message.channel.send(`${escapeMarkdown(m.user.tag)} is not rolebanned.`)

    let prevRoles = rolebanned.get(m.id) || new Collection()
    rolebanned.delete(m.id)

    m.setRoles(prevRoles, `[ Unroleban by ${message.author.tag} ]`)
      .then(_ => {
        let msg = `**${escapeMarkdown(m.user.username)}\**#${m.user.discriminator} has been unrolebanned.` +
                  `\n**ID:** ${m.id}\n` +
                  '**Roles restored:** ' + (prevRoles.size === 0 ? 'None.' :
                    '`' + prevRoles.array().map(r=>r.name).join('\`, \`') + '`')

        message.channel.send(msg)

        let logChannelId = logChannels[message.guild.id]
        if (logChannelId && message.channel.id !== logChannelId)
          message.guild.channels.get(logChannelId)
            .send(`**In:** ${message.channel}\n` + msg)
      }).catch(_ =>
        message.channel.send(`Failed to unroleban ${m.user.tag}. Check my perms?\n${_}`)
      )
  }
}

function extractMembers(arr, guild) {
  let members = arr.map(u => (a = /<@(\d+)>/.exec(u)) ? fetchMember(guild, a[1]) : fetchMember(guild, u))

  return Promise.all(members)
}

function fetchMember(guild, user) {
  return new Promise(r => guild.fetchMember(user)
           .then(m => r(m))
           .catch(e => r(null))
         )
}

function getRolebanRole(guild) {
  return guild.roles.find(r => roleNames.includes(r.name.toLowerCase()) || roleIds.includes(r.id))
}
