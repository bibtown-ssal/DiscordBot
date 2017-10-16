const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./settings.json');
const store = require('json-fs-store')();
var log = require('./store/log.json');
const urban = require('urban');
var scoreI = 0;
var DB = require('./store/Bot_and_User_Info.json');
 

//initialisation
client.on('ready',() =>{
    console.log('online and ready!');
    client.user.setGame("!help for command");
});

function user(username){
    this.username = username;
    this.score = 0;
    this.botNick = username;
    this.role = "Online";
}

client.on('guildMemberAdd', member => {
    if (!DB[member.id]){
        var person = new user(member.user.username);
        DB[member.id] = person;
        member.addRole("368260553690316801");
        saveDB();
        console.log('new person! ' + DB[member.id].username);
    }
}); 

client.on('guildMemberRemove', member => {
    delete DB[member.id];
});

function DB_ID_CHECK(id){
    if(id != "bot" || id != "id" || id != 'Houses'){
        return true;
    } return false;
}

//sanitize input (currently not in use)
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
//return the botNickname or the username if there isn't any
function answer(id){
    if(DB[id].botNick){
        return DB[id].botNick;
    }else return DB[id].username;
}
//adds the botNickname for that user
function addID(id,name){
    DB[id].botNick = name;
    store.add(DB, function(err){ if (err) throw err;})
    return;
}
//adds 1 pts to that user
function addScore(id){ 
    DB[id].score += 1;
    scoreI++;
    if (scoreI > 50) {
        saveDB();
        scoreI = 0;    
    }
    return;
}
//fills the DB w/ new users it missed
function updateUsers(members, numbers){
    console.log('start');
    for (i = 0; i < numbers; i++){
        if(!DB[members[i].user.id]){
            DB[members[i].user.id] = new user(members[i].user.username);
        }
    } 
    saveDB();
}
//save changes to the DB
function saveDB(){
    store.add(DB, function(err){ if (err) throw err;});
    console.log('saving');
    return;
}
//returns the user's score
function myScore(id){
    return beautify(DB[id].score);
}
//sorts every one's score (if score > 0)  
// NB: fix it to use for(var key in DB) instead of retrieving user list
function sortScore(){
    var arr = [];
    for(let key in DB){
        if(DB_ID_CHECK(DB[key])){
            if (DB[key].score > 0){
                arr.push([key, DB[key].score]);
            }
        }
    }
    arr.sort(function(a,b){return b[1] - a[1]});
    for(let i = 0; i < arr.length; i++){
        DB[arr[i][0]].rank = i+1;        
    }
    return arr;
}
//takes #d#+# as an arg and returns the results in a pre-set string
function roll(args){
    let pattern = /[0-9]+[d][0-9]+[\+|-]?[0-9]*/i; //tests if the incoming string is setted properly
    if(pattern.test(args)){
        let diceReg = /([0-9]+)[d]([0-9]+)([\+|-]?)([0-9]*)/i; //sets-up the regex to capture the relevant data
        let diceArray = diceReg.exec(args); //captures all the relevant bits in an Array(1d2+3,1,2,+,3)
        diceArray[1] = parseInt(diceArray[1]);
        diceArray[2] = parseInt(diceArray[2]);  //puts the stringed numbers back in int for math
        diceArray[4] = parseInt(diceArray[4]);
        let n = 0;
        let results = [];
        for (i = 0; i < diceArray[1]; i++) {
            results.push(Math.floor(Math.random()*diceArray[2]) + 1); //puts in an array each diceroll
        }
        var total = 0;
        for(let i=0; i < results.length; i++){
            total += results[i];    //sums up the dicerolls
        }
        if (diceArray[3] === '+'){ //if we add to the rolls
            total += (diceArray[4]);
            return "You rolled: " + total + " !  (" + diceArray[0] + " = " + results.join(' + ') + " + " + diceArray[4] + ")";
        }else if (diceArray[3] === '-'){ //if we substract to the rolls
            total -= (diceArray[4]);
            return "You rolled: " + total + ' !  (' + diceArray[0] + ' = ' + results.join(' + ') + ' - ' + diceArray[4] + ')';
        }else //rolls w/o modification
            return "You rolled: " + total + ' !  (' + diceArray[0] + ' = ' + results.join(' + ') + ')';
        } 
    else {message.channel.send('I don\'t understand :(  Please tell me to roll "#d#+#"!')} //if the string wasn't set properly
} 
//logs a few bot command: "date": "command,username: text"
function logged(name,text,com){
    var d = new Date();
    log[d.toString().slice(0,24)] = com + ", " +name + " : " + text;
    store.add(log, function(err){ if (err) throw err;});
    console.log('logged');
    return;
} 

function houseMembers(){
    var arr = [];
    var Ravenclaw = [];
    var Gryffindor = [];
    var Slytherin = [];
    var Hufflepuff = [];
    var Unsorted = [];
    var R = G = S = H = U = 0;
    for(let key in DB){
        if(DB_ID_CHECK(DB[key])){
            switch(DB[key].role){
                case "Ravenclaw":
                    Ravenclaw.push(DB[key].username);
                    R += DB[key].score;
                    break
                case "Slytherin":
                    Slytherin.push(DB[key].username);
                    S += DB[key].score;
                    break
                case "Hufflepuff":
                    Hufflepuff.push(DB[key].username);
                    H += DB[key].score;
                    break
                case "Gryffindor":
                    Gryffindor.push(DB[key].username);
                    G += DB[key].score;
                    break
                case "Unsorted":
                    Unsorted.push(DB[key].username);
                    U += DB[key].score;
                    break
                default: break;
            }
        }
    }
    arr.push(['Ravenclaw' , Ravenclaw, R],['Slytherin', Slytherin, S],['Hufflepuff', Hufflepuff, H],['Gryffindor', Gryffindor, G], ['Unsorted',  Unsorted, U]);
    return arr;
}

function beautify(num){
    num = num.toString();
    let j = Math.floor((num.length-1)/3); //how many '
    let k = Math.floor(num.length%3); //starting at which position
    if (k == 0){ k = 3;}    //correction for 0
    for(let i = 0; i < j; i++){     //iterate through the number adding '
        num = num.slice(0,k) + "'" + num.slice(k); 
        k += 4;     //updating next ' position
    }
    return num;
}

function order(arr,h,v){
    let result = "";
    console.log(v + v.length);
    h = h.toLowerCase().slice(0,1); // string -> lower case -> first character
    if(h == 'p' && v.length !== 0){ //order houses according to points
        arr.sort(function(a,b){return b[2] - a[2]});
        for(let i = 0; i < arr.length; i++){ //goes though each house, in order of decreasing total points
            result += i+1 + ') ' + arr[i][0] + ' (' + beautify(arr[i][2]) + ' points)\n\
            \tWith ' + arr[i][1].length + ' members, that gives them ' + beautify(Math.floor(arr[i][2]/arr[i][1].length)) + ' points per member!\n\n';
        } 
    }else if(h == "p"){
        arr.sort(function(a,b){return b[2] - a[2]});
        for(let i = 0; i < arr.length; i++){ //goes though each house, in order of decreasing total points
            result +=  i+1 + ') ' + arr[i][0] + ' (' + beautify(arr[i][2]) + ' points)\n';
        }
        result += "!points v for a more detailed version";
    }else{
        j = 0;
        switch (h){ //selects the right house, enumerates the members
            case 'r':
                result += "The Curious House of **Ravenclaw**! <:Ravenclaw:368866240523141120> :\n";
                arr[j][1].sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                for(let i = 0; i < arr[j][1].length; i++){
                    result += "\t" + arr[j][1][i] + "\n";
                }break
            case 's':
                j = 1;
                result += "The Devoted House of **Slytherin**! <:Slytherin:368866196826882049> :\n";
                arr[j][1].sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                for(let i = 0; i < arr[j][1].length; i++){
                    result += "\t" + arr[j][1][i] + "\n";
                }break
            case 'h':
                j = 2;
                result += "The Sturdy House of **Hufflepuff**! <:Hufflepuff:368866221174554627> :\n";
                arr[j][1].sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                for(let i = 0; i < arr[j][1].length; i++){
                    result += "\t" + arr[j][1][i] + "\n";
                }break
            case 'g':
                j = 3;
                result += "The Bold House of **Gryffindor**! <:Gryffindor:368866070590652416> :\n";
                arr[j][1].sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                for(let i = 0; i < arr[j][1].length; i++){
                    result += "\t" + arr[j][1][i] + "\n";
                }break
            case 'u':
                j = 4;
                result += "The Versatile **Unsorted**! :\n";
                arr[j][1].sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                for(let i = 0; i < arr[j][1].length; i++){
                    result += "\t" + arr[j][1][i] + "\n";
                }break
            default: result += "I don't understand what house you are looking for :(";
        }
        
    }
    return result;
}

function roleUpdateAll(member, numbers){
    let x;
     for(let i = 0; i < numbers; i++){
        x = member[i].hoistRole; 
        DB[members[i].user.id].role = member[i].hoistRole.name;
    }
    saveDB();
}

function clean(member, numbers){
    for(let i = 0; i < numbers; i++){
        if(DB[members[i].user.id].score == 0 && DB[members[i]]){
            member[i].addRole("368260553690316801");
            member[i].removeRole("368233731481403393");
        }
        roleUpdate(member, numbers);
    }
    saveDB();
}

function houseChange(member,house){
    house = house.toLowerCase().slice(0,1);
    let txt = "";
    let preHouse = DB[member.id].role;
    if(house.length >0){
        switch (preHouse){
            case "Ravenclaw":
                member.removeRole("352552061247815687").catch(console.error);
                break
            case "Slytherin":
                member.removeRole("352552039663796234").catch(console.error);
                break
            case "Hufflepuff":
                member.removeRole("352551973737725953").catch(console.error);
                break
            case "Gryffindor":
                member.removeRole("352552010194616332").catch(console.error);
                break
            case "Unsorted":
                member.removeRole("368233731481403393").catch(console.error);
                break
            case "Online":
                member.removeRole("368260553690316801").catch(console.error);
                break
            default:
        }
    }
    switch (house){
        case 'r':
            member.addRole("352552061247815687").catch(console.error);
            txt = "Welcome to the Curious House of Ravenclaw! <:Ravenclaw:368866240523141120>";
            DB[member.id].role = "Ravenclaw";
            break
        case 's':
            member.addRole("352552039663796234").catch(console.error);
            txt = "Welcome to the Devoted House of Slytherin! <:Slytherin:368866196826882049>";
            DB[member.id].role = "Slytherin";
            break
        case 'h':
            member.addRole("352551973737725953").catch(console.error);
            txt = "The Sturdy House of Hufflepuff! <:Hufflepuff:368866221174554627>";
            DB[member.id].role = "hufflepuff";
            break
        case 'g':
            member.addRole("352552010194616332").catch(console.error);
            txt = "Welcome to the Bold House of Gryffindor! <:Gryffindor:368866070590652416>";
            DB[member.id].role = "Gryffindor";
            break
        case 'u':
            member.addRole("368233731481403393").catch(console.error);
            txt = "Welcome to the Versatile Unsorted!!";
            DB[member.id].role = "Unsorted";
            break
        default: txt = "You haven't selected a house :(";
    }
    saveDB();
    return txt;
}

client.on('message', message => {
    //prevent bot from answering bots
    if (message.author.bot) return;
    
    let command;
    let args; 
    addScore(message.author.id);
    
    if(!message.content.startsWith(settings.prefix) /*&& message.mentions.roles.first().id != "268185157331058698" && message.mentions.members.first().user.id != '310217647252045840'*/) { //making sure the message was to the bot;; role/@bot not working currently
        return;
    } else {
        if(message.content.startsWith(settings.prefix)){
            args = message.content.slice(settings.prefix.length).trim().split(/ +/g); //removes the prefix, puts every 'word' of the message in an array(command, arg1, arg2)
            command = args.shift().toLowerCase(); //removes the first word of the array and returns it, leaving array(arg1, arg2)
        } else {
            console.log(message.content);
            return;
        }
    } 
    if(command.startsWith("!")) return; //if somebody puts '!!!' as their message, it isn't talking to the bot
    
    if (command === 'say'){ //makes the bot say something
        logged(message.author.username, args.join(" "),"say");
        if(message.author.id == '254749551221538818'){
            message.channel.send('Why do you keep making me say KUK D=  <:cry:368754447964307457>')
        }else{
            setTimeout(function(){message.delete();},50);
            message.channel.send(args.join(" "));
        }
    }
    else if(command === 'ping'){
        if(message.channel.name != 'chatter'){
            message.channel.send("I don't want to play ping pong here");
        } else{
            message.channel.send("Pong!");
        }
    }
    else  if (command === 'source'){
        message.channel.send('https://github.com/bibtown-ssal/DiscordBot/');
    }
    else  if (command === 'hug'||command === 'hugs'){
        if(!args){ //if the whole message was '!hugs' 
            message.channel.send('*hugs ' + answer(message.author.id) + ' back*');	 
        }  else{ //if the message was '!hug someone
            setTimeout(function(){message.delete();},50);
            message.channel.send('*hugs ' + args.join(" ") + '*');  
        }
    } 
    else if (command === 'selfie'){
        message.channel.send("http://i.imgur.com/dryL4OG.jpg");
    }
    else if (command === 'test'){
        message.channel.send(answer(message.author.id));
    }  
    else if (command === 'callme'){
        addID(message.author.id, args.join(" "));
        message.channel.send('I will now call you: ' + answer(message.author.id));
    } 
    else if (command === 'coin'){
        let x = Math.floor((Math.random() * 10) / 5);
        let coin = ['head', 'tail'];
        message.channel.send(coin[x] + ', ' + answer(message.author.id) + ', I hope its the result you wanted!');
    }
    else if (command === 'nickname'){
        if(args){
            DB.bot.lastname = DB.bot.botNick;
            message.channel.send("I'm changing my nickname from '" + DB.bot.lastname +"' to '" + args.join(" ") + "' thanks to " + answer(message.author.id));
            message.guild.member(client.user).setNickname(args.join(" "));
            logged(message.author.username,args.join(" "),"rename");
            addID('bot',args.join(" "));
        }
    }
    else if (command === 'choose'){
        console.log('choosing');
        let x = Math.floor(Math.random() * args.length);
        message.channel.send("I will decide for you, " + answer(message.author.id) + "!\n" + args[x] + "!");
    } 
    else if (command === 'help') {
        message.channel.send("!ping \n!coin : coinflip \n!choose option1 option2 option3 ... optionx : chooses for you!\n!roll #d#+# : will roll the dice combination!\n!nickname aName : nickname me!\n!temp ##c OR ##f :  will convert it to the other temperature scale\n!callme new name : change what the bot calls you!\n!urban word : gives you the urban dictionnary definition of a word\n!hug : give hug\n!say something : makes the bot say something\n!score : gives your score!\n!selfie = self explanatory")
    } 
    else if (command === 'temp') {
        let pattern = /(-?[0-9]+)([cf])/i;
        if (pattern.test(args[0])){
            let tempTo = pattern.exec(args[0]);
            tempTo[1] = parseInt(tempTo[1]);
            if (tempTo[2] === 'c'||tempTo[2] === 'C'){
                message.channel.send(tempTo[0] + ' is ' + Math.round(tempTo[1]*1.8+32) + '°F! (~' + Math.round(tempTo[1]+273) + 'K)');
            } else if (tempTo[2] === 'f'||tempTo[2] === 'F'){
                message.channel.send(tempTo[0] + ' is ' + Math.round((tempTo[1]-32)/1.8) + '°C! (~' + Math.round((tempTo[1]+459)/1.8) + 'K)')
            }
        } else message.channel.send('I don\'t understand :(  Please ask me about ##C or ##F');
    } 
    else if (command === 'roll'){
        message.channel.send(roll(args.join("")))
    } 
    else if (command === 'setgame'){
        if(!args){
            args = null;
        }
        client.user.setGame(args);
    } 
    else if (command === 'urban'){
        let definition = urban(args);
        definition.first(function(json){
            try{message.channel.send(args + ' \: ' + json.definition);}catch(err){message.channel.send(args + ' is not a defined word in urbandictionnary');}
        });
    } 
    else if (command === 'score'){
        let end = "th";
        sortScore();
        switch (DB[message.author.id].rank){
            case 3: 
            case 23:
            case 33:
            case 43:
            case 53:
            case 63:
            case 73:
            case 83:
            case 93:
                end = 'rd';
                break
            case 2:
            case 22:
            case 32:
            case 42:
            case 52:
            case 62:
            case 72:
            case 82:
            case 92:
                end = 'nd';
                break
            case 1:
            case 21:
            case 31:
            case 41:
            case 51:
            case 61:
            case 71:
            case 81:
            case 91: 
                end = 'st';
            default:
        }
        message.channel.send(answer(message.author.id) + " : " + myScore(message.author.id) + "  (" + DB[message.author.id].rank + end + ")");
    }
    else if (command === 'reset'){
        saveDB();
    }
    else if(command === 'usersupdate'){
        members = message.guild.members.array();
        updateUsers(members,message.guild.memberCount);
    }
    else if (command === 'roleupdateall'){
        members = message.guild.members.array();
        roleUpdateAll(members,message.guild.memberCount);
    }
    else if (command === 'hat'){
        message.channel.send(houseChange(message.member,args.join("")));
    }
/*    else if (command === 'clean'){ //removes score = 0 members from houses
        members = message.guild.members.array();
        clean(members,message.guild.memberCount);
    }*/
    else if(command === 'user'){ 
    
    }
    else if(command === 'house'){
        if(message.channel.name == 'chatter' || message.channel.name == 'bothing'){
            if(args.length){ 
                message.channel.send(order(houseMembers(),args.join(""))); //calls for the house sorter and sends the house ID
            }else {
                message.channel.send("Please ask for the house member list like this: '!House Ravenclaw'\nThank you!");
            }
        }else   message.channel.send("Please ask me this in chatter, thank you!");
    }
    else if(command === 'points'){
        if(message.channel.name == 'chatter' || message.channel.name == 'bothing'){
            message.channel.send(order(houseMembers(),command, args));
        } else message.channel.send("Please ask me this in chatter, thank you!");
    }
    else if (command === 'rank'){
        if(message.channel.name == 'chatter' || message.channel.name == 'bothing'){
            let scoreArr = sortScore();
            var top = parseInt(args);
            if (isNaN(top)){top = 5;}
            else if (top > scoreArr.length){
                top = scoreArr.length;
            }
            var mess = "";
            var i = 0;
            var j;
            for (i; i < top/2; i++){
                j = i+1;
                mess += j + ". " + DB[scoreArr[i][0]].username + " : " + beautify(scoreArr[i][1]) + "\n";
            }
            var mess2 = "";
            message.channel.send(mess);
            for (i; i < top; i++){
                j = i+1;
                mess2 += j + ". " + DB[scoreArr[i][0]].username + " : " + beautify(scoreArr[i][1]) + "\n";
            }
            message.channel.send(mess2);
        }else   message.channel.send("Please ask me this in chatter, thank you!");
    }
    else {
        message.channel.send("I don't understand what you just asked. If you meant to ask me something, type \"!help\" to see how to ask me things.");
    }
});
try{ client.login(settings.token);}catch(err){console.log(err);}