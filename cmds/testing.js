const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	name: "format",
	aliases: [],
	commandBuilder: new SlashCommandBuilder()
		.setName("format")
		.setDescription("example format"),
	async executeInteraction(interaction) {
		interaction.reply("sent info to console.");
		console.log(interaction);
	},
	async execute(msg) {},
};
