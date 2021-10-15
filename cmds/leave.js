const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
	name: "leave",
	aliases: [],
	commandBuilder: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("Stop playing music and leave channel"),
	async executeInteraction(interaction) {
		const connection = getVoiceConnection(interaction.guild.id);

		//delete queue when disconnecting
		interaction.client.queue.delete(interaction.guildId);

		//disconnect
		connection.destroy();

		//reply to user
		interaction.reply("Goodbye!👋");
	},
};
