const Discord = require('discord.js');
const bot = new Discord.Client();
const settings = require('./settings.json');
const store = require('json-fs-store')();
var idList = require('./store/Identifier.json');
const urban = require('urban');

if(!idList.botName) {
  idList.botName = 'bot';
  store.add(idList, function(err){ if (err) throw err;})
}

//initialisation
bot.on('ready',() =>{
  console.log('online and ready!');
  //message.guild.member(bot.user).setNickname(args);
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

function addID(id,name){
  idList[name] = id;
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

bot.on('message', message => {
  //prevent bot from answering bots
  if (message.author.bot) return;
  //making sure the message was to the bot
  console.log("recieved message: '" + message.content + "'");

  let parsed;
  //Prefix set, no name set, starts with prefix
  if(settings.prefix && message.content.startsWith(settings.prefix)) {
    parsed = parseArgs(message.content, settings.prefix);
  } else if(idList.botName && message.content.startsWith(idList.botName + ': ')) {
    parsed = parseArgs(message.content, idList.botName);
  }
  console.log("processing");
  let command = parsed.command;
  let args = parsed.args;
  console.log('command: "' + command + '"');
  console.log('args: "' + args + '"');

  //now either starts with prefix or 'name: '

  //stringify the message without the commend
  if (command === 'ping'){
      message.channel.send('Pong!');
  } else if (command === 'test'){
    message.channel.send(answer(message.author.id,message.author.username));
    console.log(idList);
  } else if (command === 'rename'){
    addID(args , message.author.id);
  } else if (command === 'coin'){
    let x = Math.floor((Math.random() * 10) / 5);
    let coin = ['head', 'tail'];
      message.channel.send(coin[x] + ', ' + answer(message.author.id,message.author.username) + ', I hope its the result you wanted!');
  }
  else if (message.content.startsWith(settings.prefix + 'nickname')){
    idList.botName = args
    store.add(idList, function(err){ if (err) throw err;})
    message.guild.member(bot.user).setNickname(args);
    console.log(args + ' ' + message.author.username);
  }
  else if (command === 'choose'){
    console.log('choosing');
    let x = Math.floor(Math.random() * args.split(' ').length);
    message.channel.send("I will decide for you, "+answer(message.author.id,message.author.username)+"!\n" + args.split(' ')[x]+"!");
  } else if (message.content === settings.prefix + 'help') {
      message.channel.send("!ping \n!coin : coinflip \n!choose option1 option2 option3 ... optionx : chooses for you!\n!roll #d#+# : will roll the dice combination!\n!nickname aName : nickname me!\n!temp ##c OR ##f :  will convert it to the other temperature scale\n!rename new name : change what the bot calls you!\n!urban word : gives you the urban dictionnary definition of a word")
  } else if (command === 'temp') {
    let pattern = /(-?[0-9]+)([cf])/i;
    if (pattern.test(args)){
      let tempTo = pattern.exec(args);
      tempTo[1] = parseInt(tempTo[1]);
      if (tempTo[2] === 'c'||tempTo[2] === 'C'){
        message.channel.send(tempTo[0] + ' is ' + Math.round(tempTo[1]*1.8+32) + '°F! (~' + Math.round(tempTo[1]+273) + 'K)');
      } else if (tempTo[2] === 'f'||tempTo[2] === 'F'){
        message.channel.send(tempTo[0] + ' is ' + Math.round((tempTo[1]-32)/1.8) + '°C! (~' + Math.round((tempTo[1]+459)/1.8) + 'K)')
      }
    } else message.channel.send('I don\'t understand :(  Please ask me about ##C or ##F');
  } else if (command === 'roll'){
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
    } else if(!pattern.test(dice)) {message.channel.send('I don\'t understand :(  Please tell me to roll "#d#+#"!')}
  } else if (command === 'setgame'){
    if(!args){
      args = null;
    }
      bot.user.setGame(args);
  } else if (command === 'urban'){
    let definition = urban(args);
    definition.first(function(json){
      message.channel.send(args + ' \: ' + json.definition);
    });

  } else {
    message.channel.send('What?');
  }

});

bot.login(settings.token);
