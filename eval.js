if(!args[0]) {
                const error1 = new Discord.MessageEmbed()
                    .setColor("#E74C3C")
                    .setDescription(`${emoji.error} Please enter something to evaluate!`)
    
                message.reply({ embeds: [error1] });
                return;
            }
            
            const input = message.content.split(" ").slice(1).join(" ");
            const output = eval(input);

            console.log(`${message.author.tag}, successfully evaluated: ${input}`);
            const evaluation = new Discord.MessageEmbed()
                .setColor("#1F51FF")
                .setTitle("Evaluation")
                .setDescription(`${emoji.successful} Evaluation Successful`)
                .addFields (
                    {name: "Input", value: `\`\`\`${input}\`\`\``},
                    {name: "Output", value: `\`\`\`${output}\`\`\``}
                )
                .setFooter("Command Coded by: William#0001")
                    
            message.reply({ embeds: [evaluation] });
            } catch(output) {
            const input = message.content.split(" ").slice(1).join(" ");

            const evalError = new Discord.MessageEmbed()
                .setColor("#E74C3C")
                .setTitle("Evaluation")
                .setDescription(`${emoji.error} An error occurred!`)
                .addFields (
                    {name: "Input", value: `\`\`\`${input}\`\`\``},
                    {name: "Output", value: `\`\`\`${output}\`\`\``}
                )
                .setFooter("Command Coded by: William#0001")

            message.reply({ embeds: [evalError] });
