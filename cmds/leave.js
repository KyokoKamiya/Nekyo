const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
	name: "leave",
	commandBuilder: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("Stop playing music and leave channel"),
	async executeInteraction(interaction) {
		const connection = getVoiceConnection(interaction.guild.id);
		interaction.client.queue.delete(interaction.guildId);

		connection.destroy();
		interaction.reply("Goodbye!👋");
	},
};
