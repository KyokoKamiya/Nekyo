const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const { playerManagerInteraction } = require("../include/player");
const { getVoiceConnection } = require("@discordjs/voice");
const ytpl = require("ytpl");

module.exports = {
	name: "play",
	aliases: [],
	commandBuilder: new SlashCommandBuilder()
		.setDescription("plays a Youtube song/link")
		.setName("play")
		.addStringOption((option) =>
			option.setName("query").setDescription("᲼᲼").setRequired(true)
		),

	async executeInteraction(interaction) {
		//Convenience variables
		const url = interaction.options.getString("query");
		const serverQueue = interaction.client.queue.get(interaction.guildId);

		//Regex stuff for matching
		const videoPattern =
			/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
		const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;

		//check if user is actually in a voice channel
		if (!interaction.member.voice.channelId) {
			interaction.reply("❌ Please join a voice channel first. ");
			return;
		}

		//Check if link is valid
		const urlValid = videoPattern.test(url);
		if (!urlValid) {
			interaction.reply(
				"❌ Please provide a valid youtube link, Playlists are currently not supported."
			);
			return;
		}

		//check if user and client are in the same voice channel
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

		//setting up serverQueue
		const queueConstruct = {
			songs: [],
			loop: false,
			playing: true,
			channel: interaction.channel,
		};

		// Generate song object to push into serverQueue
		const isPlaylist = playlistPattern.test(url);

		if (urlValid) {
			if (isPlaylist) {
				try {
					const playlistInfo = await ytpl(url);
					for (x of playlistInfo.items) {
						song = {
							title: x.title,
							url: x.shortUrl,
							duration: x.durationSec,
							live: x.isLive,
						};
						queueConstruct.songs.push(song);
					}
				} catch (err) {
					console.log(err);
				}
			}
			if (!isPlaylist) {
				try {
					const videoInfo = await ytdl.getInfo(url);

					song = {
						title: videoInfo.videoDetails.title,
						url: videoInfo.videoDetails.video_url,
						duration: videoInfo.videoDetails.lengthSeconds,
						live: videoInfo.videoDetails.isLiveContent,
					};
				} catch (err) {
					console.log(err);
					interaction.reply(
						"❌ Due to recent changes to youtube's EULA, age restricted videos are not available"
					);
					return;
				}
			}
		}
		//If serverQueue exists, add song to end of playlist
		if (serverQueue && !isPlaylist) {
			serverQueue.songs.push(song);
			interaction.reply(`🎶 Added ${song.title} to the queue! 🎶`);
			serverQueue.channel = interaction.channel;
			return;
		}

		//If serverqueue exists and link is playlist
		if (serverQueue && isPlaylist) {
			for (y of queueConstruct.songs) {
				serverQueue.songs.push(y);
			}
			interaction.reply(
				`🎶 Added ${queueConstruct.songs.length} songs to the Queue!🎶`
			);
			serverQueue.channel = interaction.channel;
			return;
		}

		//If serverQueue doesn't exist, start player
		queueConstruct.songs.push(song);
		interaction.client.queue.set(interaction.guildId, queueConstruct);
		try {
			playerManagerInteraction(interaction, queueConstruct.songs[0].url);
		} catch (error) {
			interaction.reply(
				"❌ An unknown error has ocurred, Most likely i don't have permissions to join your channel "
			);
		}
		if (isPlaylist) {
			interaction.reply(
				`🎶 Added ${queueConstruct.songs.length} songs to the Queue!🎶`
			);
		}
		if (!isPlaylist) {
			interaction.reply(
				`🎵 Added ${queueConstruct.songs[0].title} to the queue! 🎵`
			);
		}
		interaction.channel.send(
			`🎵 Now playing ${queueConstruct.songs[0].title} 🎵`
		);
	},
	async execute(msg) {},
};
