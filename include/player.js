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
		//comfort variables
		const queue = interaction.client.queue.get(interaction.guildId);
		const videoInfo = await ytdl.getInfo(videoId);

		//set up connection
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});

		//set up stream
		const stream = ytdl(videoId, {
			filter: videoInfo.videoDetails.isLiveContent ? null : "audioonly",
			quality: videoInfo.videoDetails.isLiveContent ? null : "highestaudio",
			dlChunkSize: 0,
			liveBuffer: 1000,
			isHLS: videoInfo.videoDetails.isLiveContent,
		});

		//create audio resource from stream
		const resource = createAudioResource(stream, {
			inputType: StreamType.Arbitrary,
			inlineVolume: true,
		});

		resource.volume.setVolume(0.2);

		//create audio player
		const player = createAudioPlayer();

		try {
			// make player play to audioresource(stream)
			player.play(resource);

			// subscripe voice connection to player
			connection.subscribe(player);
		} catch (err) {
			console.log(err);
		}

		//Debug and error handling stuff
		// player.on("debug", (bla) => {
		// 	console.log(bla);
		// });
		// player.on("stateChange", (bli) => {
		// 	console.log(bli);
		// });
		player.on("error", (err) => {
			console.log(err);
		});
		// stream.on("end", (asdf) => {
		// 	console.log(asdf);
		// });
		// stream.on("close", (asdf) => {
		// 	console.log(asdf);
		// });
		stream.on("error", (asdf) => {
			console.log(asdf);
		});
		// stream.on("data", (data) => {
		// 	console.log(data);
		// });

		//If song finished, cycle to the next song
		player.on(AudioPlayerStatus.Idle, async () => {
			//if last song
			if (queue.songs.length == 1) {
				queue.channel.send("❌ No more songs in queue");
				interaction.client.queue.delete(interaction.guildId);
				return;
			}

			//check if loop
			if (queue.loop) {
				let lastSong = queue.songs.shift();
				queue.songs.push(lastSong);
			} else {
				queue.songs.shift();
			}

			try {
				player.stop();

				let newResource = createAudioResource(
					ytdl(queue.songs[0].url, {
						filter: queue.songs[0].live ? null : "audioonly",
						quality: queue.songs[0].live ? null : "highestaudio",
						dlChunkSize: 0,
						liveBuffer: 1000,
						isHLS: queue.songs[0].live,
					}),
					{
						inputType: StreamType.Arbitrary,
						inlineVolume: true,
					}
				);

				newResource.volume.setVolume(0.2);

				//play new audio resource
				player.play(newResource);
			} catch (err) {
				console.log(err);
			}
			queue.channel.send(`🎵 Now playing ${queue.songs[0].title} 🎵`);
		});

		//if skip command is received
		interaction.client.on("commandSkip", async (interaction) => {
			interaction.reply(`⏩ Skipped ${queue.songs[0].title} ⏩ `);

			//If last song in queue
			if (queue.songs.length == 1) {
				interaction.client.queue.delete(interaction.guildId);
				player.stop();
				return;
			}

			//check if loop
			if (queue.loop) {
				let lastSong = queue.songs.shift();
				queue.songs.push(lastSong);
			} else {
				queue.songs.shift();
			}
			try {
				player.stop();

				let newResource = createAudioResource(
					ytdl(queue.songs[0].url, {
						filter: queue.songs[0].live ? null : "audioonly",
						quality: queue.songs[0].live ? null : "highestaudio",
						dlChunkSize: 0,
						liveBuffer: 1000,
						isHLS: queue.songs[0].live,
					}),
					{
						inputType: StreamType.Arbitrary,
						inlineVolume: true,
					}
				);

				newResource.volume.setVolume(0.2);
				//play new resource
				player.play(newResource);
			} catch (err) {
				console.log(err);
			}
			queue.channel.send(`🎵 Now playing ${queue.songs[0].title} 🎵`);
		});

		//disconnect handling
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
