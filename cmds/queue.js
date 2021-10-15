const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	name: "queue",
	aliases: [],
	commandBuilder: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Show song queue"),
	async executeInteraction(interaction) {
		interaction.reply("WIP");
	},
	async execute(msg) {},
};
