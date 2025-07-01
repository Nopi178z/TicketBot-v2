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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close-ticket')
        .setDescription('Đóng Ticket hiện tại'),
    async execute(interaction) {
        if (!interaction.channel.name.startsWith('ticket-')) {
            return interaction.reply({
                content: 'Bạn chỉ có thể sử dụng lệnh này trong kênh ticket.',
                ephemeral: true,
            });
        }

        await interaction.reply({ content: 'Đang đóng ticket...' });
        await interaction.channel.delete();  
    },
};
