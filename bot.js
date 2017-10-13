const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./settings.json');
//var score = require('./store/Score.json');
const store = require('json-fs-store')();
//var idList = require('./store/Identifier.json');
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
    this.role = "";
}

client.on('guildMemberAdd', member => {
    var person = new user(member.user.username);
    DB[member.id] = person;
    member.addRole("368261968685039636");
    saveDB();
    console.log('new person!');
}); 
 
//sanitize input
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function answer(id,name){
  if(DB[id].botNick){
    return DB[id].botNick;
  }else return name;
}

function addID(id,name){
  DB[id].botNick = name;
  store.add(DB, function(err){ if (err) throw err;})
  return;
}



/*function reload(){
    score = require('./store/Score.json');
    console.log('reloading score');
}*/ //figure out how to make it do that, right now it doesn't seem to want to load from file, only save to once it did the loading on line4

function addScore(id){ 
    DB[id].score += 1;
    scoreI++;
    if (scoreI > 50) {
        saveDB();
        scoreI = 0;    
    }
    return;
}

function updateUsers(members, numbers){
    console.log('start');
    for (i = 0; i < numbers; i++){
        
        //DB[members[i].user.id].role = members[i].hoistRole.name;
    } 
    saveDB();
    console.log('end');
}

function saveDB(){
    store.add(DB, function(err){ if (err) throw err;});
    console.log('saving');
}

function myScore(id){
    console.log(id, DB[id], DB['bot']);
    return DB[id].score;
}

function sortScore(member, numbers){
    var arr = [];
    for (i = 0; i < numbers; i++){
        if(DB[member[i].user.id].score > 0){
            arr.push([DB[member[i].user.id].username, DB[member[i].user.id].score])
        }
    }
    /*for (var name in score){
        arr.push([name, score[name]]);
    }*/
    arr.sort(function(a,b){return b[1] - a[1]});
    //console.log(arr);
    return arr;
}

function parseArgs(message, prefix) {
  command = message.slice(prefix.length);
  //remove anything after a space from command
  if(command.indexOf(' ') !== -1) {
    command = command.slice(0, command.indexOf(' '));
  }
  args = message.splice(prefix.length, message.length);
  return {
    command: command,
    args: args,
  }
}



client.on('message', message => {
  //prevent bot from answering bots
  if (message.author.bot) return;
  //making sure the message was to the bot
//  console.log("recieved message: '" + message.content + "'");

  let command;
  let args; 
  //Prefix set, no name set, starts with prefix
  
  addScore(message.author.id);
  
  if(settings.prefix) {
    if(!message.content.startsWith(settings.prefix)) {
      return;
    } else {
      command = message.content.substr(0,message.content.indexOf(' ')).substring(1);
      args = message.content.substr(message.content.indexOf(' ')+1);
      if (!command) {command = args.substring(1);}
    }
  } 

  if(command.startsWith("!")) return;
  if (command === 'ping'){
      message.channel.send('Pong!');
  }
  else  if (command === 'say'){
      message.delete();
      message.channel.send(args);
  }
  else  if (command === 'source'){
      message.channel.send('https://github.com/bibtown-ssal/DiscordBot/');
  }
  else  if (command === 'hug'||command === 'hugs'||command === 'HUG'||command === 'HUGS'||command === 'Hugs'||command === 'Hug'){
      if(args === '!hug'||args === '!hugs'||args === '!HUG'||args === '!HUGS'||args === '!Hugs'||args === '!Hug'){	  
        message.channel.send('*hugs ' + answer(message.author.id,message.author.username) + ' back*');	 
       }  else{
           message.delete();
           message.channel.send('*hugs ' + args + '*');  
       }
  } 
  else if (command === 'selfie'){
      message.channel.send("http://i.imgur.com/dryL4OG.jpg");
  }
  else if (command === 'test'){
    message.channel.send(answer(message.author.id,message.author.username));
    //console.log(DB[message.author.id].username);
  }  
  else if (command === 'callme'){
    addID(message.author.id, args);
    message.channel.send('I will now call you: ' + answer(message.author.id,message.author.username));
  } 
  else if (command === 'coin'){
    let x = Math.floor((Math.random() * 10) / 5);
    let coin = ['head', 'tail'];
      message.channel.send(coin[x] + ', ' + answer(message.author.id,message.author.username) + ', I hope its the result you wanted!');
  }
  else if (command === 'nickname'){
      if(args != '!nickname' /*&& message.author.id == '256642313550430220'*/){
        DB.bot.lastname = DB.bot.botNick;
        message.channel.send("I'm changing my nickname from '" + DB.bot.lastname +"' to '" + args + "' thanks to " + answer(message.author.id,message.author.username));
        message.guild.member(client.user).setNickname(args);
        console.log(args + ' ' + message.author.username);
        addID('bot',args);
      }
  }
  else if (command === 'choose'){
    console.log('choosing');
    let x = Math.floor(Math.random() * args.split(' ').length);
    message.channel.send("I will decide for you, "+answer(message.author.id,message.author.username)+"!\n" + args.split(' ')[x]+"!");
  } 
  else if (command === 'help') {
      message.channel.send("!ping \n!coin : coinflip \n!choose option1 option2 option3 ... optionx : chooses for you!\n!roll #d#+# : will roll the dice combination!\n!nickname aName : nickname me!\n!temp ##c OR ##f :  will convert it to the other temperature scale\n!callme new name : change what the bot calls you!\n!urban word : gives you the urban dictionnary definition of a word\n!hug : give hug\n!say something : makes the bot say something\n!score : gives your score!\n!selfie = self explanatory")
  } 
  else if (command === 'temp') {
    let pattern = /(-?[0-9]+)([cf])/i;
    if (pattern.test(args)){
      let tempTo = pattern.exec(args);
      tempTo[1] = parseInt(tempTo[1]);
      if (tempTo[2] === 'c'||tempTo[2] === 'C'){
        message.channel.send(tempTo[0] + ' is ' + Math.round(tempTo[1]*1.8+32) + '°F! (~' + Math.round(tempTo[1]+273) + 'K)');
      } 
  else if (tempTo[2] === 'f'||tempTo[2] === 'F'){
        message.channel.send(tempTo[0] + ' is ' + Math.round((tempTo[1]-32)/1.8) + '°C! (~' + Math.round((tempTo[1]+459)/1.8) + 'K)')
      }
    } else message.channel.send('I don\'t understand :(  Please ask me about ##C or ##F');
  } 
  else if (command === 'roll'){
    let pattern = /[0-9]+[d][0-9]+[\+|-]?[0-9]*/i;
    if(pattern.test(args)){
      let diceReg = /([0-9]+)[d]([0-9]+)([\+|-]?)([0-9]*)/i;
      let diceArray = diceReg.exec(args);
      diceArray[1] = parseInt(diceArray[1]);
      diceArray[2] = parseInt(diceArray[2]);
      let n = 0;
      let results = [];
      for (i = 0; i < diceArray[1]; i++) {
        results.push(Math.floor(Math.random()*diceArray[2]) + 1);
      }
      var total = 0;
      for(i=0; i < results.length; i++){
        total += results[i];
      }
      if (diceArray[3] === '+'){
        total += diceArray[4];
        message.channel.send("You rolled: " + total + ' !  (' + diceArray[0] + ' = ' + results.join(' + ') + ', +' + diceArray[4] + ')');
      }else if (diceArray[3] === '-'){
        total -= diceArray[4];
        message.channel.send("You rolled: " + total + ' !  (' + diceArray[0] + ' = ' + results.join(' + ') + ', -' + diceArray[4] + ')');
      }else
      message.channel.send("You rolled: " + total + ' !  (' + diceArray[0] + ' = ' + results.join(' + ') + ')');
    } 
  else if(!pattern.test(dice)) {message.channel.send('I don\'t understand :(  Please tell me to roll "#d#+#"!')}
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
    message.channel.send(answer(message.author.id,message.author.username) + " : " + myScore(message.author.id));
  }
  else if (command === 'reset'){
    saveScore();
  }
  else if(command === 'users'){
      members = message.guild.members.array();
      updateUsers(members,message.guild.memberCount);
  }
  else if (command === 'rank'){
      scoreArr = sortScore(message.guild.members.array(),message.guild.memberCount);
      var top = parseInt(args);
      if (isNaN(top)){top = 5;}
      else if (top > scoreArr.length){
          top = scoreArr.length;
      }
      var mess = "";
      var i = 0;
      var j = i+1;
      for (i; i < top/2; i++){
          j = i+1;
          mess += j;
          mess += ". ";
          mess += scoreArr[i][0];
          mess += " : ";
          mess += scoreArr[i][1];
          mess += "\n";
      }
      var mess2 = "";
      message.channel.send(mess);
            for (i; i < top; i++){
          j = i+1;
          mess2 += j;
          mess2 += ". ";
          mess2 += scoreArr[i][0];
          mess2 += " : ";
          mess2 += scoreArr[i][1];
          mess2 += "\n";
      }
      message.channel.send(mess2);
  }
  else {
    message.channel.send("I don't understand what you just asked. If you meant to ask me something, type \"!help\" to see how to ask me things.");
  }
});
try{ client.login(settings.token);}catch(err){console.log(err);}