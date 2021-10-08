const ytdl = require("ytdl-core");
const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} = require("@discordjs/voice");
const { VoiceConnectionStatus, entersState } = require("@discordjs/voice");

module.exports = {
	async playerManagerInteraction(interaction, videoId) {
		const queue = interaction.client.queue.get(interaction.guildId);
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});

		const stream = ytdl(videoId, {
			filter: "audioonly",
		});
		const resource = createAudioResource(stream, {
			inputType: StreamType.Arbitrary,
		});
		const player = createAudioPlayer();

		player.play(resource);
		connection.subscribe(player);

		player.on(AudioPlayerStatus.Idle, async () => {
			if (queue.loop) {
				let lastSong = queue.songs.shift();
				queue.songs.push(lastSong);
			} else {
				queue.songs.shift();
			}

			player.play(
				createAudioResource(
					ytdl(queue.songs[0].url, {
						filter: "audioonly",
					}),
					{
						inputType: StreamType.Arbitrary,
					}
				)
			);
		});

		connection.on(
			VoiceConnectionStatus.Disconnected,
			async (oldState, newState) => {
				try {
					await Promise.race([
						entersState(
							connection,
							VoiceConnectionStatus.Signalling,
							5_000
						),
						entersState(
							connection,
							VoiceConnectionStatus.Connecting,
							5_000
						),
					]);
					// Seems to be reconnecting to a new channel - ignore disconnect
				} catch (error) {
					// Seems to be a real disconnect which SHOULDN'T be recovered from
					interaction.client.queue.delete(interaction.guildId);
					connection.destroy();
					player.stop;
				}
			}
		);
	},
};
