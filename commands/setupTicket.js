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

const { SlashCommandBuilder } = require('discord.js');
const { setTicketSetup } = require('../models/ticketSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Cấu hình hệ thống ticket cho máy chủ này')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Kênh gửi nút tạo ticket')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('admin-roles')
                .setDescription('Danh sách phân tách bằng dấu phẩy của ID vai trò quản trị viên có thể quản lý phiếu')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('Bật hoặc tắt hệ thống vé')
                .setRequired(true)
        ),

    async execute(interaction) {
       
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.options.getChannel('channel');
            const adminRoles = interaction.options.getString('admin-roles').split(',');
            const enabled = interaction.options.getBoolean('enabled');

         
            await setTicketSetup(interaction.guildId, channel.id, adminRoles, enabled);

          
            await interaction.followUp({
                content: `Cấu hình hệ thống vé đã được lưu! Hệ thống vé hiện đã **${enabled ? 'enabled' : 'disabled'}**.`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);

         
            await interaction.followUp({
                content: `Đã xảy ra lỗi khi lưu cấu hình hệ thống vé. Vui lòng thử lại.`,
                ephemeral: true
            });
        }
    }
}
};
