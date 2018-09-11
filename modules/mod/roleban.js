const rolebanCmds   = ['roleban', 'forebode', 'toss', 'defenestrate', 'shup', 'suplex']
const unRolebanCmds = ['unroleban', 'unforebode', 'untoss', 'refenestrate']
const roleNames = ['roleban', 'rolebanned', 'tossed', 'muted', 'foreboden', 'silenced']

module.exports.config = {
  name: 'roleban',
  invokers: [...rolebanCmds, ...unRolebanCmds],
  help: 'Gives roles',
  expandedHelp: 'Replaces all of a user\'s roles with a roleban role\nRequires "Manage Roles", supports multiple users at once.\nName a role one of ' + roleNames.map(v => '`' + v + '`').join(', '),
  usage: ['Roleban a dude', 'roleban [@user|userID]', 'Roleban many dudes', 'roleban [@user userID @user...]', 'Unroleban', 'unroleban @user']
}

const mentionRegex = /<@!?[0-9]+>/
const rolebanned = new Map()
const {escapeMarkdown} = require('discord.js').Util
const {Collection} = require('discord.js')

module.exports.events = {}
module.exports.events.message = async (bot, message) => {
  if (!message.guild)
    return
  if (!message.member.permissions.has('MANAGE_ROLES'))
    return message.channel.send('You need at least `Manage Roles`.')

  const [cmd, ...users] = bot.sleet.shlex(message)
  const rbRole = getRolebanRole(message.guild)

  if (rbRole === null)
    return message.channel.send('I could not find a role to use, name a role one of: `' + roleNames.join('`, `') + '`.')

  if (message.member.highestRole.position <= rbRole.position)
    return message.channel.send('Your highest role needs to higher than the `' + rbRole.name + '` role to (un)roleban.')

  let members = await extractMembers(users, message.guild)

  bot.logger.debug(members)

  if (members.every(m => m === null))
    return message.channel.send('I got nobody to (un)roleban.')


  if (rolebanCmds.includes(cmd))
    roleban(bot, message, members, rbRole)
  else if (unRolebanCmds.includes(cmd))
    unroleban(bot, message, members, rbRole)

  // this should never be reached
}

function roleban(bot, message, members, rbRole, options = {}) {
  for (let m of members) {
    if (m === null) continue

    if (m.id === message.author.id) {
      message.channel.send(`You're trying to roleban yourself. I appreciate your dedication though.`)
      continue
    }

    if (m.id === bot.user.id) {
      message.channel.send('I am not rolebanning myself.')
      continue
    }

    if (message.member.highestRole && message.member.highestRole.position <= m.highestRole.position) {
      message.channel.send(`${escapeMarkdown(m.user.tag)} is either higher or equal to you.`)
      continue
    }

    if (m.roles.has(rbRole.id)) {
      message.channel.send(`${escapeMarkdown(m.user.tag)} is already rolebanned!`)
      continue
    }

    let prevRoles = m.roles.filter(r => r.id !== m.guild.id)

    m.setRoles([rbRole], `[ Roleban by ${message.author.tag} ]`)
      .then(_ => {
        let msg = `${fUser(m.user)} has been rolebanned.` +
                  `\n**ID:** ${m.id}` +
                  `\n**By:** ${message ? message.author.tag : bot.user.tag}` +
                  '\n**Previous roles:** ' + (prevRoles.size === 0 ? 'None.' :
                    '`' + prevRoles.array().map(r=>r.name).join('\`, \`') + '`')

        if (!options.silent) message.channel.send(msg)

        rolebanned.set(m.id, prevRoles)
      }).catch(_ => {
        message.channel.send(`Failed to roleban ${m.user.tag}. Check my perms?\n${_}`)
        //bot.sleet.reportError(_, 'roleban')
      })
  }
}
module.exports.roleban = roleban

function unroleban(bot, message, members, rbRole) {
  for (let m of members) {
    if (m === null) continue
    if (!m.roles.has(rbRole.id)) {
      message.channel.send(`${escapeMarkdown(m.user.tag)} is not rolebanned.`)
      continue
    }

    let prevRoles = rolebanned.get(m.id) || m.roles
    prevRoles = prevRoles.filter(r => r.id !== rbRole.id && r.id !== m.guild.id)

    m.setRoles(prevRoles, `[ Unroleban by ${message.author.tag} ]`)
      .then(_ => {
        let msg = `${fUser(m.user)} has been unrolebanned.` +
                  `\n**ID:** ${m.id}` +
                  `\n**By:** ${message ? message.author.tag : bot.user.tag}\n` +
                  (rolebanned.delete(m.id) ?
                    '**Roles restored:** ' + (prevRoles.size === 0 ? 'None.' :
                      '`' + prevRoles.array().map(r=>r.name).join('\`, \`') + '`')
                  : 'No roles restored.')

        message.channel.send(msg)
      }).catch(_ =>
        message.channel.send(`Failed to unroleban ${m.user.tag}. Check my perms?\n${_}`)
      )
  }
}
module.exports.unroleban = unroleban

async function extractMembers(arr, guild) {
  let members = arr.map(u => (a = /<@!?(\d+)>/.exec(u)) ? fetchMember(guild, a[1]) : fetchMember(guild, u))

  return Promise.all(members)
}

function fetchMember(guild, user) {
  return new Promise(r => guild.fetchMember(user)
           .then(m => r(m))
           .catch(e => r(null))
         )
}

function getRolebanRole(guild) {
  return guild.roles.find(r => roleNames.includes(r.name.toLowerCase()))
}

function fUser(u) {
  return '**' + escapeMarkdown(u.username) + '**#' + u.discriminator
}
