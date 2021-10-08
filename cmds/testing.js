const { SlashCommandBuilder } = require("@discordjs/builders");
const { execute } = require("./play");

module.exports = {
	name: "format",
	commandBuilder: new SlashCommandBuilder()
		.setName("format")
		.setDescription("example format"),
	async executeInteracion(interaction) {
		console.log(interaction);
		interaction.reply("This is just a test command you doodoohead");
	},
	async execute(msg) {},
};
