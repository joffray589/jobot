import {Interaction} from "discord.js";
import {Command, SlashCommand} from "../Command";

const { SlashCommandBuilder } = require('@discordjs/builders');
export class PingCommand extends Command{

    constructor(name, description) {
        super(name, description);
    }

    getSlashCommand(): SlashCommand {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription('ping')
            .toJSON();
    }

    execute(interaction: Interaction) : Promise<void>{
        if(interaction.isCommand()){
            interaction.reply({content: 'pong', ephemeral:true});
        }
        return Promise.resolve();
    }



}