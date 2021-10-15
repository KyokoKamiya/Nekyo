const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	name: "ping",
	aliases: [],
	commandBuilder: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("🏓 in ms"),

	async executeInteraction(interaction) {
		interaction.reply({
			content: `🏓Latency is ${Date.now() - interaction.createdTimestamp}ms`,
			ephemeral: true,
		});
	},
};
