const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientID, guildID, token } = require("./config.json");
const { readdirSync } = require("fs");
const { join } = require("path");
const dotenv = require("dotenv").config();

module.exports = function deployCommands() {
	//Loading commands
	const cmdFiles = readdirSync(join(__dirname, "cmds")).filter((file) =>
		file.endsWith(".js")
	);

	//setting up commands array for pushing
	let commands = [];
	//Loading commands from ./cmds and pushing commandBuilder to array
	for (const file of cmdFiles) {
		const command = require(join(__dirname, "cmds", `${file}`));
		commands.push(command.commandBuilder);
	}

	//Converting commands into JSON for REST
	commands.map((command) => command.toJSON());

	// Sending commands to discord via REST
	const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

	rest
		.put(Routes.applicationGuildCommands(clientID, guildID), {
			body: commands,
		})
		.then(() => console.log("Successfully registered application commands."))
		.catch(console.error);
};
