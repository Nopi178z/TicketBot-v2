
const { getTicketSetup } = require('../models/ticketSetup');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ChannelType, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Icons = require('../UI/Icons');
module.exports = async (client) => {
    client.on('ready', () => {
        setInterval(async () => {
            const guilds = client.guilds.cache;

            for (const guild of guilds.values()) {
                try {
                    const setup = await getTicketSetup(guild.id);
                    if (!setup || !setup.ticketSystemEnabled) continue;

                    const channel = guild.channels.cache.get(setup.ticketChannelId);
                    if (!channel) {
                        //console.warn(`No channel found for ID ${setup.ticketChannelId} in guild ${guild.id}`);
                        continue;
                    }

                    if (channel.type !== ChannelType.GuildText) {
                        //console.warn(`Channel ${channel.id} is not a text channel.`);
                        continue;
                    }

                    const existingMessages = await channel.messages.fetch({ limit: 1 });
                    if (existingMessages.size === 0) {
                        const embed = new EmbedBuilder()
                        .setAuthor({
                            name: "Nô Lệ Bán Hàng",
                            iconURL: Icons.ticketIcon,
                            url: " https://discord.gg/NwtBUA7njn"
                        })
                        .setDescription('- Vui lòng nhấp vào nút bên dưới để tạo ticket mua hàng.\n\n' +
                            '**Dùng ticket để:**\n' +
                            '- Mua hàng / hỏi giá / thông tin sản phẩm\n' +
                            '- Hãy kiên nhẫn trong khi chờ đợi phản hồi từ Shop của tui.')
                        .setFooter({ text: 'Sẵn sàng phục vụ bạn!', iconURL: Icons.modIcon })
                        .setColor('#FCB6FD'); 
                        

                        const button = new ButtonBuilder()
                            .setCustomId('create_ticket')
                            .setLabel('Mua Hàng')
                            .setStyle(ButtonStyle.Primary);

                        const row = new ActionRowBuilder().addComponents(button);

                        try {
                            await channel.send({ embeds: [embed], components: [row] });
                            //console.log(`Sent ticket setup message in channel ${channel.id} of guild ${guild.id}`);
                        } catch (sendError) {
                            //console.error(`Error sending message in channel ${channel.id} of guild ${guild.id}:`, sendError);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing guild ${guild.id}:`, error);
                }
            }
        }, 10000);
    });

    client.on('interactionCreate', async (interaction) => {
        if (interaction.isButton()) {
            if (interaction.customId === 'create_ticket') {
                const modal = new ModalBuilder()
                    .setCustomId('ticket_modal')
                    .setTitle('Hỗ Trợ');

                const subjectInput = new TextInputBuilder()
                    .setCustomId('ticket_subject')
                    .setLabel('Chủ đề ticket của bạn')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const descriptionInput = new TextInputBuilder()
                    .setCustomId('ticket_description')
                    .setLabel('Mô tả vấn đề của bạn')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const firstActionRow = new ActionRowBuilder().addComponents(subjectInput);
                const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

                modal.addComponents(firstActionRow, secondActionRow);

                // Show the modal to the user
                await interaction.showModal(modal);
            }
        }

      
      if (interaction.isModalSubmit()) {
            if (interaction.customId === 'ticket_modal') {
                // Defer the reply to avoid "Unknown interaction" errors
                await interaction.deferReply({ ephemeral: true });

                const subject = interaction.fields.getTextInputValue('ticket_subject');
                const description = interaction.fields.getTextInputValue('ticket_description');

                const setup = await getTicketSetup(interaction.guildId);
                const existingTicket = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username}`);
                if (existingTicket) {
                    return await interaction.followUp({ content: 'Bạn đã tạo ticket! Nếu chưa, vui lòng liên hệ với Shop.', ephemeral: true });
                }

                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: ['ViewChannel'] },
                        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
                        ...setup.adminRoleIds.map(roleId => ({
                            id: roleId, allow: ['ViewChannel', 'SendMessages']
                        }))
                    ]
                });

                const openEmbed = new EmbedBuilder()
                    .setAuthor({
                        name: "Đã tạo ticket thành công",
                        iconURL: Icons.tickIcon,
                        url: "https://discord.gg/NwtBUA7njn"
                    })
                    .setDescription(`Kênh ticket của bạn: ${ticketChannel.url}`)
                    .setFooter({ text: 'Nô Lệ Bán Hàng', iconURL: Icons.modIcon })
                    .setColor('#FCB6FD'); 

                await interaction.user.send({ embeds: [openEmbed] });

                const embed = new EmbedBuilder()
                    .setTitle(`Sub: ${subject}`)
                    .setDescription(description)
                    .setColor('#FFFF00')
                    .setFooter({ text: `Tạo bởi ${interaction.user.username}` });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('ping_admin').setLabel('Ping Admin').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('ticket_info').setLabel('Ticket Info').setStyle(ButtonStyle.Primary)
                    );

                await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });

                await interaction.followUp({ content: 'Ticket của bạn đã được tạo!', ephemeral: true });
            }
        }


        if (interaction.isButton()) {
            if (interaction.customId === 'close_ticket') {
                if (!interaction.channel.name.startsWith('ticket-')) {
                    return await interaction.reply({ content: 'Bạn chỉ có thể sử dụng lệnh này trong ticket.', ephemeral: true });
                }

                await interaction.reply({ content: 'Đang đóng ticket...' });
                await interaction.channel.delete();
            } else if (interaction.customId === 'ping_admin') {
                const setup = await getTicketSetup(interaction.guildId);
                const adminRoleMentions = setup.adminRoleIds.map(roleId => `<@&${roleId}>`).join(', ');
                await interaction.channel.send(`- Attention ${adminRoleMentions}! Thượng đế đã tạo ticket cầu hỗ trợ.`);
                await interaction.reply({ content: 'Chủ Shop đã được thông báo.', ephemeral: true });
            } else if (interaction.customId === 'ticket_info') {
                const embed = new EmbedBuilder()
                    .setTitle(`Thông tin ticket`)
                    .setDescription(`Ticket tạo bởi: <@${interaction.user.id}>`)
                    .addFields({ name: 'Ticket mua hàng:', value: interaction.channel.name })
                    .setColor('#FCB6FD');

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    });
};
