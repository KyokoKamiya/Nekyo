const { SlashCommandBuilder } = require("@discordjs/builders");
const { joinVoiceChannel } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const { playerManagerInteraction } = require("../include/player");

module.exports = {
	name: "play",
	commandBuilder: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Plays a Youtube song")
		.addStringOption((option) => option.setName("query").setRequired(true)),

	async executeInteraction(interaction) {
		// ❌
		//Convenience variables
		const url = interaction.options.getString("link");
		const serverQueue = interaction.client.queue.get(interaction.guildId);

		//Regex stuff for matching
		const videoPattern =
			/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
		const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;

		//Check if link is valid
		const urlValid = videoPattern.test(url);
		if (!urlValid) {
			interaction.reply("❌ Please provide a valid link");
			return;
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
		console.log(serverQueue);
		if (serverQueue) {
			serverQueue.songs.push(song);
			return;
		}

		queueConstruct.songs.push(song);
		interaction.client.queue.set(interaction.guildId, queueConstruct);

		playerManagerInteraction(interaction, url);
	},
	async execute(msg) {},
};
