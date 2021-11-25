const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('caca')
        .setDescription('vote pour le badge caca')
        .addUserOption(option => option.setName("cible").setDescription("cible du vote").setRequired(true)),
    new SlashCommandBuilder()
        .setName('spin')
        .setDescription('Spin de bb')
        .addStringOption(option => option.setName("choix").setDescription("liste de choix (séparés par des virgules)").setRequired(true)),
    new SlashCommandBuilder()
        .setName('color')
        .setDescription('Changer la couleur de son role')
        .addRoleOption(option => option.setName('role').setDescription('role à modifier').setRequired(true))
        .addStringOption(option => option.setName('couleur').setDescription('couleur au format hexadecimal ex : #7b4f30').setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);