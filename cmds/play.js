const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const { playerManagerInteraction } = require("../include/player");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
	name: "play",
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

		//Check if link is valid
		const urlValid = videoPattern.test(url);
		if (!urlValid) {
			interaction.reply(
				"❌ Please provide a valid youtube link, Playlists are currently not supported."
			);
			return;
		}

		if (getVoiceConnection(interaction.guildId)) {
			if (
				!getVoiceConnection(interaction.guildId).joinConfig.channelId ===
				interaction.member.voice.channelId
			) {
				interaction.reply(
					"❌ Nekyo is currently being used in another channel ❌"
				);
				return;
			}
		}

		//self explanatory
		const queueConstruct = {
			songs: [],
			loop: false,
			playing: true,
			channel: interaction.channel,
		};

		// Generate song object to push into serverQueue
		if (urlValid) {
			try {
				const videoInfo = await ytdl.getInfo(url);

				song = {
					title: videoInfo.videoDetails.title,
					url: videoInfo.videoDetails.video_url,
					duration: videoInfo.videoDetails.lengthSeconds,
				};
			} catch (err) {
				console.log(err);
				interaction.reply(
					"❌ An unexpected error happened while trying to fetch your video"
				);
				return null;
			}
		}
		//If playlist exists, add song to end of playlist
		if (serverQueue) {
			serverQueue.songs.push(song);
			interaction.reply(
				`🎶 Added ${queueConstruct.songs[0].title} to the queue! 🎶`
			);
			return;
		}

		queueConstruct.songs.push(song);
		interaction.client.queue.set(interaction.guildId, queueConstruct);
		interaction.reply(`🎵 Now playing ${queueConstruct.songs[0].title} 🎵`);
		playerManagerInteraction(interaction, url);
	},
	async execute(msg) {},
};
