// Require the necessary discord.js classes
const { Client, Intents, Collection, ClientUser } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const dotenv = require("dotenv").config();

// Create a new client instance
const client = new Client({
	intents: [
		"GUILDS",
		"GUILD_MEMBERS",
		"GUILD_BANS",
		"GUILD_EMOJIS_AND_STICKERS",
		"GUILD_INTEGRATIONS",
		"GUILD_WEBHOOKS",
		"GUILD_INVITES",
		"GUILD_VOICE_STATES",
		"GUILD_PRESENCES",
		"GUILD_MESSAGES",
		"GUILD_MESSAGE_REACTIONS",
		"GUILD_MESSAGE_TYPING",
		"DIRECT_MESSAGES",
		"DIRECT_MESSAGE_REACTIONS",
		"DIRECT_MESSAGE_TYPING",
	],
});

//Setting up Global variables in client
client.commands = new Collection();
client.prefix = process.env.PREFIX;
client.queue = new Map();
if (process.env.DEBUG === "1") {
	client.kDebug = true;
} else {
	client.kDebug = false;
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);

	client.user.setActivity(`Your Commands ♥`, { type: "LISTENING" });

	//Check for debug
	if (client.kDebug) {
		console.log("DEBUG MODE IS ENABLED");
	}
});

// Send errors to console
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

// Load Commands
const cmdFiles = readdirSync(join(__dirname, "cmds")).filter((file) =>
	file.endsWith(".js")
);
for (const file of cmdFiles) {
	const command = require(join(__dirname, "cmds", `${file}`));
	client.commands.set(command.name, command);
	if (client.kDebug) {
		console.log(`Imported command ${command.name}`);
	}
}

//On command receive
client.on("interactionCreate", async (interaction) => {
	//If not a command return
	if (!interaction.isCommand()) return;

	//Check which command it corresponds to
	const command = client.commands.get(interaction.commandName);
	if (client.kDebug) {
		console.log(
			`Received ${interaction.commandName} | ${interaction.member.user.tag} | ${interaction.guild.name}`
		);
	}
	//Try executing command
	try {
		await command.executeInteraction(interaction);
	} catch (error) {
		console.log(error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

//on Message event
// client.on("message", (message) => {
// 	// Return if message is from bot or a DM
// 	console.log("testing");
// 	if (message.author.bot) return;
// 	if (!message.guild) return;

// 	//If Message doesn't contain Prefix or Bot mention, return
// 	const prefixRegex = new RegExp(
// 		`^(<@!?${client.user.id}>|${escapeRegex("!")})\\s*`
// 	);
// 	console.log(!prefixRegex.test(message.content));
// 	if (!prefixRegex.test(message.content)) return;

// 	// Slice message into useful variables
// 	const [, matchedPrefix] = message.content.match(prefixRegex);

// 	const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
// 	const commandName = args.shift().toLowerCase();

// 	//Check if command exists
// 	const commands =
// 		client.commands.get(commandName) ||
// 		client.commands.find(
// 			(cmd) => cmd.aliases && cmd.aliases.includes(commandName)
// 		);

// 	if (!command) return;

// 	try {
// 		command.execute(message, args);
// 	} catch (error) {
// 		console.error(error);
// 		message
// 			.reply("Unkown Error, please contact <@687013516451774621>")
// 			.catch(console.error);
// 	}
// });

client.login(process.env.TOKEN);
