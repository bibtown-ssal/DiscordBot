const Discord = require('discord.js');
const bot = new Discord.Client();
const settings = require('./settings.json');
const store = require('json-fs-store')();
var idList = require('./store/Identifier.json');
const urban = require('urban');


//initialisation
bot.on('ready',() =>{
    console.log('online and ready!');
    bot.user.setGame("!help for command");
});
//sanitize input
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function answer(id,name){
  if(idList[id]){
    return idList[id];
  }else return name;
}

function nickcallback(nick){
    return function(){
        message.guild.member(bot.user).setNickname(nick);
        //message.channel.send("I'm changing my nickname to '" + name + "' thanks to " + answer(message.author.id,message.author.username));
    }
}

function addID(id,name){
  idList[id] = name;
  store.add(idList, function(err){ if (err) throw err;})
  return;
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


try{
bot.on('message', message => {
  //prevent bot from answering bots
  if (message.author.bot) return;
  //making sure the message was to the bot
//  console.log("recieved message: '" + message.content + "'");

  let command;
  let args;
  //Prefix set, no name set, starts with prefix
  if(settings.prefix) {
    if(!message.content.startsWith(settings.prefix)) {
      return;
    } else {
      command = message.content.substr(0,message.content.indexOf(' ')).substring(1);
      args = message.content.substr(message.content.indexOf(' ')+1);
      if (!command) {command = args.substring(1);}
    }
  } 
  else if(IDlist.name) {
   if(!message.content.startsWith(IDlist.name + ': ')) {
      return;
   } else {
      command = message.content.slice(message.content.indexOf(IDlist.name + ': ') + (IDlist.name + ': ').length);
      if(command.indexOf(' ') !== -1) {
        command = command.slice(0, command.indexOf(' '));
      }
      args = message.content.split(" ").slice(2).join(" ");
   }
  } else {
    console.log('must set name or prefix');
}
/*
  let parsed;
  //Prefix set, no name set, starts with prefix
  if(settings.prefix && message.content.startsWith(settings.prefix)) {
    parsed = parseArgs(message.content, settings.prefix);
  } 
  else if(idList.botName && message.content.startsWith(idList.botName + ': ')) {
    parsed = parseArgs(message.content, idList.botName);
  }
//  console.log("processing");
  let command = parsed.command;
  let args = parsed.args;
  console.log('command: "' + command + '"');
  console.log('args: "' + args + '"');
  //now either starts with prefix or 'name: '*/

  //stringify the message without the command
  if(command.startsWith("!")) return;
  if (command === 'ping'){
      message.channel.send('Pong!');
  }
  else  if (command === 'say'){
      message.channel.send(args);
  }
  else  if (command === 'source'){
      message.channel.send('https://github.com/bibtown-ssal/DiscordBot/');
  }
  else  if (command === 'hug'||command === 'hugs'||command === 'HUG'||command === 'HUGS'||command === 'Hugs'||command === 'Hug'){
      if(args === '!hug'||args === '!hugs'||args === '!HUG'||args === '!HUGS'||args === '!Hugs'||args === '!Hug'){	  
        message.channel.send('*hugs ' + answer(message.author.id,message.author.username) + ' back*');	 
       }  else{message.channel.send('*hugs ' + args + '*');  }
  } 
  else if (command === 'test'){
    message.channel.send(answer(message.author.id,message.author.username));
//    console.log(idList);
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
      if(args != '!nickname'){
      message.channel.send("I'm changing my nickname to '" + args + "' thanks to " + answer(message.author.id,message.author.username));
      message.guild.member(bot.user).setNickname(args);
//      setTimeout(nickcallback(args), 750);
      console.log(args + ' ' + message.author.username);
      addID('name',args);
}
  }
  else if (command === 'choose'){
    console.log('choosing');
    let x = Math.floor(Math.random() * args.split(' ').length);
    message.channel.send("I will decide for you, "+answer(message.author.id,message.author.username)+"!\n" + args.split(' ')[x]+"!");
  } 
  else if (message.content === settings.prefix + 'help') {
      message.channel.send("!ping \n!coin : coinflip \n!choose option1 option2 option3 ... optionx : chooses for you!\n!roll #d#+# : will roll the dice combination!\n!nickname aName : nickname me!\n!temp ##c OR ##f :  will convert it to the other temperature scale\n!callme new name : change what the bot calls you!\n!urban word : gives you the urban dictionnary definition of a word\n!hug : give hug\n!say something : makes the bot say something")
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
      bot.user.setGame(args);
  } 
  else if (command === 'urban'){
    let definition = urban(args);
    definition.first(function(json){
        try{message.channel.send(args + ' \: ' + json.definition);}catch(err){message.channel.send(args + ' is not a defined word in urbandictionnary');}
    });

  } 
  else {
    message.channel.send("I don't understand what you just asked. If you meant to ask me something, type \"!help\" to see how to ask me things.");
  }
  
});}catch(err){console.log(err);}
try{ bot.login(settings.token);}catch(err){console.log(err);}