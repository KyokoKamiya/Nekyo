const { SlashCommandBuilder } = require("@discordjs/builders");
const { joinVoiceChannel, AudioPlayer } = require("@discordjs/voice");

module.exports = {
	name: "join",
	aliases: [],
	commandBuilder: new SlashCommandBuilder()
		.setName("join")
		.setDescription("cummies")
		.addStringOption((option) =>
			option
				.setName("input")
				.setDescription("enter a string")
				.setRequired(true)
		),
	async executeInteraction(interaction) {
		let channelId = interaction.member.voice.channel.id;
		let guildId = interaction.guildId;
		let adapterCreator = interaction.guild.voiceAdapterCreator;
		const connection = joinVoiceChannel({
			channelId: interaction.channel.id,
			guildId: interaction.channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});

		const subscription = connection.subscribe(AudioPlayer);

		if (subscription) {
			// Unsubscribe after 5 seconds (stop playing audio on the voice connection)
			setTimeout(() => subscription.unsubscribe(), 5_000);
		}

		// const connection = joinVoiceChannel(
		// 	{
		// 		channelId: interaction.member.voice.channel.id.toString(),
		// 		guildId: interaction.guildId.toString(),
		// 		selfDeaf: true,
		// 	},
		// 	{
		// 		adapterCreator: interaction.guild.voiceAdapterCreator,
		// 		debug: true,
		// 	}
		// );
	},
};
