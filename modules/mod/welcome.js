module.exports.config = {
  name: 'welcome',
  invokers: null,
  help: 'welcomes people',
  expandedHelp:'i need to make this more generic',
  invisible: true,
  autoLoad: false
}

const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

const welcomes = {
  'server id': {
    message: '{@user} message',
    channel: 'channel to welcome',
    rejoins: false,
    instant: false,
    ignoreR: ['role id']
  }
}

let handler = {
  get(target, name) {
    if ( !(name in target) ) target[name] = new Set()
    return target[name]
  }
}

let newJoins = new Proxy({}, handler)
// guildId => Sets of new user Ids

module.exports.events = {}
module.exports.events.guildMemberAdd = async (bot, member) => {
  let wlcm = welcomes[member.guild.id], guild = member.guild, channel = guild.channels.first().id

  if (wlcm === undefined) return

  if (wlcm.rejoins === false) {
    let file = path.join(__dirname, 'join', guild.id + '.txt')
    if (fs.readFileSync(file, 'utf8').includes(member.id)) return
    fs.appendFileSync(file, ' ' + member.id)
  }

  if (!['auto', 'default'].includes(wlcm.channel))
    channel = wlcm.channel

  if (wlcm.instant)
    sendWelcome( bot.channels.get(channel), member, wlcm.message )
  else
    newJoins[guild.id].add(member.id)
}

module.exports.events.message = async (bot, message) => {
  if (!message.guild || !newJoins[message.guild.id].has(message.author.id)) return

  let wlcm = welcomes[message.guild.id], chn = message.channel.id
  if (wlcm.ignoreR && wlcm.ignoreR.some(r => message.member.roles.has(r))) return

  newJoins[message.guild.id].delete(message.author.id)

  if (!['auto', 'default'].includes(wlcm.channel)) chn = wlcm.channel

  sendWelcome( bot.channels.get(chn), message.author, wlcm.message )
}

function sendWelcome(channel, user, msg) {
  if (channel === null) return
  return channel.send( textReplace(msg, {user}) )
}

function textReplace(msg, data = {user: '?', channel: '?'}) {
  return msg.replace(/{@user}/g, data.user.toString())
}
