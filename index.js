const Discord = require("discord.js");
const DisTube = require("distube");
const client = new Discord.Client({disableMentions: "everyone"});
const config = {
    prefix: "&",
    token: "#Your Token bot"
}
const distube = new DisTube(client, {searchSongs: true, emitNewSongOnly: true, highWaterMark: 1<<25})

const filters = ["3d","bassboost","echo","karaoke","nightcore","vaporwave","flanger"];

client.login(config.token);

client.on("ready", () =>{ 
    client.user.setActivity("เปิดเพลงพิมพ์ &play",{type: "STREAMING"});
})

client.on("message", message => {
    if(message.author.bot){ return; 
    if(!message.guild) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift();

    if(command === "ping"){
        return embedbuilder(client, message, `BLUE`, `ปิงบอท:`, `\`${client.ws.ping} ms\``)
    }

    if(command === "play" || command === "p"){
        embedbuilder(client, message, "YELLOW", "กำลังค้นหา โปรดรอ!", args.join(" "))
        return distube.play(message, args.join(" "));
    }
    if(command === "skip" || command === "s"){
        embedbuilder(client, message, "YELLOW", "ข้ามเพลงแล้ว!", `Skipped the song`)
        return distube.skip(message);
    } 
    if(command === "stop" || command === "leave"){
        embedbuilder(client, message, "RED", "หยุดเพลงทั้งหมด!", `และออกห่องแล้ว`)
        return distube.stop(message);
    }
    if(command === "seek"){
        embedbuilder(client, message, "GREEN", "กำลังหา!", `กำลังหาเพลงนี้ \`${args[0]} seconds\``)
        return distube.seek(message, Number(args[0]*1000));
    } 
    if(filters.includes(command)) {
        let filter = distube.setFilter(message, command);
        return embedbuilder(client, message, "YELLOW", "กำลังใส่ฟิลเตอร์!", ฟิลเตอร์)
    }
    if(command === "volume" || command === "vol"){
        embedbuilder(client, message, "GREEN", "ปรับเสียง", `ไปที่ \`${args[0]} %\``)
        return distube.setVolume(message, args[0]);
    } 
    if (command === "queue" || command === "qu"){
        let queue = distube.getQueue(message);
        let curqueue = queue.songs.map((song, id) =>
        `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).join("\n");
        return  embedbuilder(client, message, "GREEN", "กำลังใส่เพลงในรายการ", curqueue)
    }
    if (command === "loop" || command === "repeat"){
        if(0 <= Number(args[0]) && Number(args[0]) <= 2){
            distube.setRepeatMode(message,parseInt(args[0]))
            embedbuilder(client, message, "GREEN", "กำลังเล่นเพลงซ้ำ:!", `${args[0].replace("0", "OFF").replace("1", "เพลงซ้ำ").replace("2", "เพลงซ้ำทั้งหมด")}`)
        } else{
            embedbuilder(client, message, "RED", "เกิดข้อผิดพลาด", `กรุณาใช้ตัว **0** ถึง **2**   |   *(0: ปิด, 1: ซ้ำเพลงเดียว, 2: ซ้ำหมดรายการ)*`)
        }
    }
    if ( command === "jump"){
        let queue = distube.getQueue(message);
        if(0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length){
            embedbuilder(client, message, "RED", "เกิดข้อผิดพลาด", `ข้าม ${parseInt(args[0])} เพลง!`)
            return distube.jump(message, parseInt(args[0]))
            .catch(err => message.channel.send("กรุณาใส่ตัวเลขให้ถูก."));
        } else {
            embedbuilder(client, message, "RED", "ERROR", `Please use a number between **0** and **${DisTube.getQueue(message).length}**   |   *(0: ปิด, 1: ซ้ำเพลงเดียว, 2: ซ้ำทั้งหมด)*`)
        }
    }
})

const status = (queue) => `ระดับความดัง: \`${queue.volume}\` | ฟิลเตอร์: \`${queue.filter || "ปิด"}\` | วนเพลง: \`${queue.repeatMode ? queue.repeatMode === 2 ? "วนเพลงทั้งหมด" : "เพลงนี้" : "ปิด"}\` | เล่นอัตโนมัติ: \`${queue.autoplay ? "เปิด" : "ปิด"}\``
distube
     .on("playSong", (message, queue, song) => 
        embedbuilder(client, message, "GREEN", "กำลังเล่นเพลงใหม่!", `เพลง: \`${song.name}\`  -  \`${song.formattedDuration}\` \n\nขอเพลงโดย: ${song.user}\n${status(queue)}`)
     })
     .on("addSong", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "เพิ่มเพลง!", `เพลง: \`${song.name}\`  -  \`${song.formattedDuration}\` \n\nขอเพลงโดย: ${song.user}`)
     })
     .on("playList", (message, queue, playlist, song) => 
        embedbuilder(client, message, "GREEN", "กำลังเล่นเพลย์ลิสต์", `เพลย์ลิสต์: \`${playlist.title}\`  -  \`${playlist.total_items} เพลง\` \n\nขอเพลงโดย: ${song.user}\n\nกำลังเริ่มเพลง: \`${song.name}\`  -  \`${song.formattedDuration}\`\n${status(queue)}`)
     })
     .on("addList", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "เพิ่มเพลง!", `Playlist: \`${playlist.title}\`  -  \`${playlist.total_items} เพลง\` \n\nขอเพลงโดย: ${song.user}`)
     })
     .on("searchResult", (message, result) => {
        let i = 0;
        embedbuilder(client, message, "YELLOW", "", `**กรุณาเลือกตัวเลข**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*กรุณาใส่รายการที่จะค้นหาภายใน 60 วินาที ก่อนจะถูกยกเลิก*`)
    })
     .on("searchCancel", (message) =>  embedbuilder(client, message, "RED", `การค้นหาถูกยกเลิก`, "")
     )
     .on("error", (message, err) => embedbuilder(client, message, "RED", "เกิดข้อผิดพลาด:", err)
     )
     
function embedbuilder(client, message, color, title, description){
    let embed = new Discord.MessageEmbed()
    .setColor(color)
    .setFooter(client.user.username, client.user.displayAvatarURL());
    if(title) embed.setTitle(title);
    if(description) embed.setDescription(description);
    return message.channel.send(embed);
}
