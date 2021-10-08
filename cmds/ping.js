const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	name: "ping",
	commandBuilder: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("🏓 in ms"),

	async execute(interaction) {
		interaction.reply({
			content: `🏓Latency is ${Date.now() - interaction.createdTimestamp}ms`,
			ephemeral: true,
		});
	},
};
