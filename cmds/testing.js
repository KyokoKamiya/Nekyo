const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
	name: "format",
	commandBuilder: new SlashCommandBuilder()
		.setName("format")
		.setDescription("example format"),
	async executeInteraction(interaction) {
		interaction.reply("sent info to console.");
		console.log(getVoiceConnection(interaction.guildId));
	},
	async execute(msg) {},
};
