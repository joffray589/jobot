/*
https://discord.com/api/oauth2/authorize?client_id=523545758591614986&permissions=268511296&scope=bot%20applications.commands
 */

import {GuildMember, Message, Permissions, Snowflake, TextChannel} from "discord.js";
const { Client, Intents } = require('discord.js');

import {spin} from './bot/actions/spin/bbspin';

var config = require("./config.json");

const client = new Client({ intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES
    ] });


const htmlColorRegexp = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

const cacaRoleId = '414486860748947456';

const fs = require('fs');

const EMBED_FILE_PATH = "./embeds.json";
var embedLoaded = false;
var storedEmbeds = [];
var autodelete = false;



const loadEmbeds = () => {

    try{
        if (fs.existsSync(EMBED_FILE_PATH)) {
            storedEmbeds = JSON.parse(fs.readFileSync(EMBED_FILE_PATH));
        }
    }
    catch(e){
        console.log("Erreur lecture : " + e);
    }

    embedLoaded = true;
};

const saveEmbeds = () => {
    fs.writeFileSync(EMBED_FILE_PATH, JSON.stringify(storedEmbeds));
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async message => {

    if(!message.content.startsWith('!')){
        return;
    }

    const messageContent = message.content;

    if (message.content.startsWith('!bigcheh')) {
        return message.channel.send('🇨 🇭 🇪 🇭')
            .then(() => message.react('🇨'))
            .then(() => message.react('🇭'))
            .then(() => message.react('🇪'))
            .then(() => message.react('🏩'));
    }

    if((messageContent.startsWith('!embed') || messageContent.startsWith('!countdown')) && !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){
        //await message.reply('Permission manquante');
        return;
    }

    const args = messageContent.split(" ");

    if(!embedLoaded){
        loadEmbeds();
    }

    if(messageContent.startsWith("!embeds")){
        await message.channel.send("Affichages de la liste des embeds (" + storedEmbeds.length + ")");
        for(var i=0; i<storedEmbeds.length; i++){
            await message.channel.send("------------------\nEmbed " + (i+1));
            await message.channel.send({embeds : [storedEmbeds[i].embed]});
        }

        await message.channel.send("Fin de la liste");
    }
    else if(messageContent.startsWith("!embed-clear")){
        storedEmbeds = [];
        saveEmbeds();
        message.channel.send("Les embeds sauvegardés ont été effacés");
    }
    else if(messageContent.startsWith("!embed-del")){
        if(isNaN(args[1])){
            message.channel.send("Id invalide");
        }
        else if(!storedEmbeds[parseInt( args[1]) - 1 ]){
            message.channel.send("Aucun id spécifié");
        }
        else{
            //context.message.delete();
            const id = parseInt(args[1]) - 1;
            delete storedEmbeds[id];
            saveEmbeds();
            message.channel.send('embed ' + args[1] + ' effacé');
        }
    }
    else if(messageContent.startsWith("!embed-defrag")){
        var newStore = [];
        for(let i=0; i<storedEmbeds.length; i++){
            if(storedEmbeds[i]){ newStore.push(storedEmbeds[i]); }
        }
        storedEmbeds = newStore;
        saveEmbeds();
        message.channel.send("Les embeds sauvegardés ont été défragmentés");
    }
    else if(messageContent.startsWith("!embed-auto-del")){
        autodelete = !autodelete;
        await message.reply(autodelete ? "effacement auto activé" : "effacement auto désactivé");
    }
    else if(messageContent.startsWith("!embed-store")){
        const embedString = messageContent.substring("!embed-store".length);

        try{
            storedEmbeds.push(JSON.parse(embedString));
            saveEmbeds();
            await message.reply('Embed sauvegardé avec l\'id ' + storedEmbeds.length);
        }
        catch (e) {
            await message.reply('Erreur lors du stockage, le json est sûrement invalide');
        }

    }
    else if(messageContent.startsWith("!embed ")){
        if(isNaN(args[1]) || !storedEmbeds[parseInt( args[1]) - 1 ]){
            await message.reply('Id invalide');
        }
        else{
            const embed = storedEmbeds[ parseInt(args[1]) - 1 ];
            await message.channel.send({embeds : [storedEmbeds[ parseInt(args[1]) - 1 ].embed]});

            if(autodelete){
                await message.delete();
            }


            if(!isNaN(args[2])){
                setTimeout(async () => {
                    await message.channel.send("Le temps est écoulé");
                }, parseInt(args[2] ) * 1000);
            }


        }
    }
    else if(messageContent.startsWith("!countdown ")){
        if(isNaN(args[1])){
            await message.reply('Durée du timer invalide');
        }
        else{
            let endTime = args[1] * 60 * 1000, elapsed = 0;
            let isPaused = false, isStopped = false;
            let updateInterval = 5000;

            let timerMessage : Message = await message.channel.send("Timer lancé : " + args[1] + "m restantes");
            const collector = timerMessage.createReactionCollector({time: 3600000});

            await timerMessage.react("⏯");
            await timerMessage.react("⏹");
            await timerMessage.react("➕");


            let interval = setInterval(async () => {

                if(!isPaused) { elapsed += updateInterval }

                if(isStopped || elapsed >= endTime){
                    clearInterval(interval);
                    collector.stop();
                    if(isStopped){
                        //await timerMessage.edit("Timer arrêté");
                        await timerMessage.channel.send("Timer arrêté");
                    }
                    else{
                        timerMessage = await timerMessage.edit("Timer lancé : 0s restantes");
                        await timerMessage.channel.send("Temps écoulé");
                    }

                    await timerMessage.reactions.removeAll();
                }
                else{
                    const min = Math.trunc((endTime - elapsed)/60000);
                    const sec = ((endTime - elapsed) % 60000)/1000;
                    let timerString = "Timer lancé : ";
                    if(min>=1){ timerString += "" + min + "m"; }
                    if(sec>0){ timerString += "" + sec + "s"; }
                    timerString += " restantes";

                    if(isPaused){ timerString += " (en pause)";}

                    timerMessage = await timerMessage.edit(timerString);
                }
            }, updateInterval);



            collector.on('collect', async (reaction, user) => {
                const member = timerMessage.guild.members.cache.get(user.id);


                if(user.id === client.user.id) return;

                if(!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){
                    console.log("NON ADMIN, PERMISSION REFUSE");
                    await reaction.users.remove(user.id);
                }
                else if(reaction.emoji.name === '⏯'){
                    isPaused = !isPaused;
                    if(isPaused){
                        await timerMessage.edit(timerMessage.content + " (en pause)");
                    }
                    else{
                        await timerMessage.edit(timerMessage.content.replace(" (en pause)", ""));
                    }

                    await reaction.users.remove(user.id);
                }
                else if(reaction.emoji.name === '⏹'){
                    isStopped = true;
                    await timerMessage.edit(timerMessage.content + " (stoppé)");
                    await reaction.users.remove(user.id);
                }
                else if(reaction.emoji.name === '➕'){
                    endTime += 60000;
                    await timerMessage.edit(timerMessage.content + " (1min ajoutée)");
                    await reaction.users.remove(user.id);
                }
            });

        }
    }

})

client.on('interactionCreate', async interaction => {

    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        console.log(interaction.member.roles);
        await interaction.reply({ content : 'Pong!', ephemeral: true});
    }
    else if(interaction.commandName === 'color'){

        const role = interaction.options.getRole('role');
        const color = interaction.options.getString('couleur');

        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !interaction.member.roles.cache.has(role.id) ){
            await interaction.reply({ content : "tu ne peux pas changer la couleur du role " + role.name + " car celui ci ne t'est pas affecté", ephemeral: true });
        }
        else if(!color.match(htmlColorRegexp)){
            await interaction.reply({ content : color + ' n\'est pas une couleur au format hexa valide', ephemeral: true });
        }
        else{
            const oldColor = role.hexColor;
            role.setColor(color)
                .then(role => {
                    interaction.reply({content : "Couleur du role " + role.name + " modifiée : " + oldColor + " -> " + color, ephemeral: true });
                })
                .catch(error => {
                    interaction.reply( { content : "Une erreur est survenue : " + error, ephemeral: true });
                    console.log(error);
                });
        }

    }
    else if(interaction.commandName === 'spin'){
        const choices = interaction.options.getString('choix').split(",");
        console.log("choices = " + choices);
        spin(choices, interaction);
    }
    else if(interaction.commandName === 'caca'){
        const cacaUser = interaction.options.getUser('cible');

        const cacaMember = interaction.guild.members.cache.get(cacaUser.id);

        const time = 24 * 3600 * 1000;
        const voteTime = 15000;

        let voteMsgContent = "Vote pour mettre un badge caca sur " + cacaMember.displayName;

        const message = await interaction.reply({content: voteMsgContent + " (fin du vote dans 5min)", fetchReply:true});
        await message.react('👍');
        await message.react('👎');

        let voteDelta = 0;
        let cacaDuration = 3600 * 24 * 1000;
        let voteDuration = 300000;

        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) ;
        };

        const collector = (message as Message).createReactionCollector({time: voteDuration});

        collector.on('collect', async (reaction, user) => {
            if(user.id == cacaUser.id){
                try{
                    await reaction.users.remove(cacaUser.id);
                }
                catch(error){
                    console.log("Remove reaction error : " + error);
                }
            }
        });

        collector.on('end', collected => {

            let voteDelta = 0;
            let votedYes = [], votedNo = [];
            collected.forEach(reaction => {
                if(reaction.emoji.name === '👍'){
                    reaction.users.cache.forEach(user => {
                        if(user.id != client.user.id){
                            votedYes.push(user.username);
                            voteDelta++;
                        }
                    });
                }
                else if(reaction.emoji.name === '👎'){
                    reaction.users.cache.forEach(user => {
                        if(user.id != client.user.id){
                            votedNo.push(user.username);
                            voteDelta--;
                        }
                    });
                }
            });

            if(voteDelta >= 3){
                let cacaRole = cacaMember.guild.roles.cache.get(cacaRoleId);
                cacaMember.roles.add(cacaRole);

                voteMsgContent += "\n-----------------\n";

                if(votedYes.length > 0){
                    voteMsgContent += "pour   : " ;
                    votedYes.forEach( name => voteMsgContent += (name + ", "));
                    voteMsgContent = voteMsgContent.substring(0, voteMsgContent.length -2);
                    voteMsgContent += "\n";
                }

                if(votedNo.length > 0 ){
                    voteMsgContent += "contre : ";
                    votedNo.forEach( name => voteMsgContent += (name + " ,"));
                    voteMsgContent = voteMsgContent.substring(0, voteMsgContent.length -2);
                    voteMsgContent += "\n";
                }

                voteMsgContent += "✅ Vote accepté, " + cacaMember.displayName + " prend un badge caca pendant 24h";

                interaction.editReply({content : voteMsgContent});

                setTimeout(() => {
                    cacaMember.roles.remove(cacaRole);
                }, cacaDuration);

            }
            else{
                voteMsgContent += "\n-----------------\n";

                if(votedYes.length > 0){

                    voteMsgContent += "pour   : " ;
                    votedYes.forEach( name => voteMsgContent += (name + " "));
                    voteMsgContent += "\n";
                }

                if(votedNo.length > 0 ){
                    voteMsgContent += "contre : ";
                    votedNo.forEach( name => voteMsgContent += (name + " "));
                }

                voteMsgContent += "❌ Vote refusé";


                interaction.editReply({content : voteMsgContent});
            }
        });
    }
});



client.login(config.token);