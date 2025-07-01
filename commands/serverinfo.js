/*

  ________.__                        _____.___.___________
 /  _____/|  | _____    ____  ____   \__  |   |\__    ___/
/   \  ___|  | \__  \ _/ ___\/ __ \   /   |   |  |    |   
\    \_\  \  |__/ __ \\  \__\  ___/   \____   |  |    |   
 \______  /____(____  /\___  >___  >  / ______|  |____|   
        \/          \/     \/    \/   \/                  

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  ## Created by GlaceYT!                                                ║
║  ## Feel free to utilize any portion of the code                       ║
║  ## DISCORD :  https://discord.com/invite/xQF9f9yUEM                   ║
║  ## YouTube : https://www.youtube.com/@GlaceYt                         ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝


*/

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Hiển thị thông tin chi tiết về máy chủ'),
    async execute(interaction) {
        const server = interaction.guild;
        const emojis = server.emojis.cache;
        const roles = server.roles.cache;
        const textChannels = server.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').size;
        const voiceChannels = server.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').size;
        const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Very High'];
        const defaultNotifications = ['All Messages', 'Only Mentions'];

        try {
            const owner = await server.members.fetch(server.ownerId);
            if (!owner) {
                throw new Error('Không tìm thấy chủ sở hữu máy chủ.');
            }

            const boosters = server.premiumSubscriptionCount;
            const boostLevel = server.premiumTier;

            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle('📊 Server Info')
                .setThumbnail(server.iconURL({ format: 'png', dynamic: true, size: 1024 }))
                .setDescription(`
                    **Server Name:** ${server.name}
                    **Server ID:** ${server.id}
                    **Owner:** ${owner.user.tag}
                    **Created At:** ${server.createdAt.toUTCString()}
                    **Members:** ${server.memberCount}
                    **Boosters:** ${boosters} (Level ${boostLevel})
                    **Emojis:** ${emojis.size} emojis
                    **Roles:** ${roles.size} roles
                    **Text Channels:** ${textChannels}
                    **Voice Channels:** ${voiceChannels}
                    **Verification Level:** ${verificationLevels[server.verificationLevel]}
                    **Default Notifications:** ${defaultNotifications[server.defaultMessageNotifications]}
                `)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Lỗi khi tìm thông tin máy chủ:', error);
            await interaction.reply('Đã xảy ra lỗi khi lấy thông tin máy chủ.');
        }
    }
  
    },
};
