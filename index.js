// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { token, prefix, status, game } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		// const user = client.users.cache.get(interaction.member.user.id);
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			try {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			} catch (error
			) {
				console.error(error);
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	}
 else if (interaction.isAutocomplete) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
			try {
			await interaction.followUp({content: "There was an error while executing this command!", ephemeral: true});
			} catch (error) {
				console.error(error);
				await interaction.followUp({content: "There was an error while executing this command!", ephemeral: true});
			}
		}
	}

});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	game.push(`${client.guilds.cache.size} servers`);
	const activities = game;
	//console.log(game)
	const updateDelay = 5; // in seconds
  	let currentIndex = 0;
	  setInterval(() => {
		const activity = activities[currentIndex];
		client.user.setActivity((activity), { type: ActivityType.Watching });
		  
			// update currentIndex
		// if it's the last one, get back to 0
		currentIndex = currentIndex >= activities.length - 1 
		  ? 0
		  : currentIndex + 1;
	  }, updateDelay * 1000);
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);