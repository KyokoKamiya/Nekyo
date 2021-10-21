const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
	name: "skip",
	aliases: [],
	commandBuilder: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("skips current song"),
	async executeInteraction(interaction) {
		//If client is not connected to voice channel, ignore command
		if (!getVoiceConnection(interaction.guildId)) {
			interaction.reply("❌ Player is currently not playing anything");
			return;
		}

		//If client is in a different voice channel or user is not in a voice channel, ignore command
		if (getVoiceConnection(interaction.guildId)) {
			let testStatus = getVoiceConnection(interaction.guildId).packets.state
				.channel_id;

			if (testStatus !== interaction.member.voice.channelId) {
				interaction.reply(
					"❌ Nekyo is currently being used in another channel ❌"
				);
				return;
			}
		}

		//If Queue is empty
		const queue = await interaction.client.queue.get(interaction.guildId);

		if (!queue) {
			interaction.reply(
				"❌ There are no more songs in the queue to skip to."
			);
			return;
		}

		// Send emit to player.js with relevant data
		interaction.client.emit("commandSkip", interaction);
	},
	async execute(msg) {},
};
