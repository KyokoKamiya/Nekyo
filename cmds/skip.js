const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
	name: "skip",
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

		// Send emit to player.js with relevant data
		interaction.client.emit("commandSkip", interaction);
	},
	async execute(msg) {},
};
