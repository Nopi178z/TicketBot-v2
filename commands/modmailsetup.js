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
const { setModmailSetup } = require('../models/modmailSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-modmail')
        .setDescription('Cấu hình hệ thống ModMail cho máy chủ này')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Thể loại để tạo kênh ModMail trong')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('admin-roles')
                .setDescription('Danh sách phân tách bằng dấu phẩy của ID vai trò quản trị viên có thể quản lý modmail')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('Bật hoặc tắt hệ thống ModMail')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getChannel('category');
        const adminRoles = interaction.options.getString('admin-roles').split(',');
        const enabled = interaction.options.getBoolean('enabled');

        await setModmailSetup(interaction.guildId, category.id, adminRoles, enabled);

        await interaction.followUp({
            content: `Cấu hình hệ thống ModMail đã được lưu! ModMail hiện đã **${enabled ? 'enabled' : 'disabled'}**.`,
            ephemeral: true
        });
    }
};
