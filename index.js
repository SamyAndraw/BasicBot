const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Made By Samy#1566!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

const discord = require('discord.js');
const fs = require('fs');
const client = new discord.Client({
	autoReconnect: true,
	partials: ["MESSAGE", "CHANNEL", "GUILD_MEMBER", "REACTION", "MESSAGE", "USER"]
});
const config = require('./config.json')

client.commands = new discord.Collection();
client.aliases = new discord.Collection();
client.queue = new Map();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
	const event = require(`./events/${file}`)
	if(event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
	client.on(event.name, (...args) => event.execute(...args, client));
	}
}

const command_files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))

for (file of command_files) {
        const command = require(`./commands/${file}`);
        const command_name = file.split('.')[0];
        
        if (command.name) {
        console.log(`${command_name} loaded!`)
        
        client.commands.set(command.name, command)
        } else {
                continue
        }
}




const Categories = ["music"];

Categories.forEach(async function(Category) { //
    fs.readdir(`./commands/${Category}`, async function(error, files) {
      if (error) throw new Error(`Error In Command - Command Handler\n${error}`);
      files.forEach(async function(file) {
        if (!file.endsWith(".js")) throw new Error(`A File Does Not Ends With .js - Command Handler!`);
        let command = require(`./commands/${Category}/${file}`);
   
        if (!command.name || !command.aliases) throw new Error(`No Command Name & Command Aliases In A File - Command Handler!`);
        if (command.name) client.commands.set(command.name, command);
        if (command.aliases) command.aliases.forEach(aliase => client.aliases.set(aliase, command.name));
        if (command.aliases.length === 0) command.aliases = null;
      });
    });
});

client.on("message", async message => {

  let Prefix = config.prefix

  if (message.author.bot || !message.guild || message.webhookID) return;

  if (!message.content.startsWith(Prefix)) return;

  let args = message.content.slice(Prefix.length).trim().split(/ +/g);
  let cmd = args.shift().toLowerCase();

  let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));

  if (!command) return console.log(`No Command Found!`);



  if (command) {
    command.run(client, message, args);
  
  } else {
    if (command === 'ban') {
      const userBan = message.mentions.users.first();

      if (userBan) {
        var member = message.guild.member(userBan);

        if (member) {
            member.ban({
              reason: "you broke the rules."
            }).then(() => {
              message.reply(`${userBan.tag} was banned from the server.`)
            })
        } else {
           message.reply('that user is not in the server.');
        }
      } else {
         message.reply('you need to state a user to ban.')
      }
    }
  }

});


client.login(process.env.TOKEN)
