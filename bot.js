const Discord = require('discord.js');
const bot = new Discord.Client();
const settings = require('./settings.json');
var IDlist = require('./Identifier.json');
const fs = require('fs');
//initialisation
bot.on('ready',() =>{
    console.log('online and ready!');
    bot.user.setGame("!help for command")
});
//sanitize input
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function answer(id,name){
  if(IDlist[id]){
    return IDlist[id];
  }else return name;
}

/*function addID(id,name){
  var abc = {};
  abc[id] = name;
  fs.readFile('Identifier.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    obj = JSON.parse(data); //now it an object
    obj.push({abc}); //add some data
    json = JSON.stringify(obj); //convert it back to json
    fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back
}});
  console.log(IDlist);

  return;
}*/
//can't make it work :(

bot.on('message', message => {
  if (message.author.bot) return;
  //prevent bot from answering bots
  if (!message.content.startsWith(settings.prefix))return;
  //making sure the message was to the bot
  let args = message.content.split(" ").slice(1);
  //Arrays the message without the commend
  let argsresult = args.join(" ");
  //stringify the message without the commend
  if (message.content === settings.prefix + 'ping'){
      message.channel.send('Pong!');
  }//answers 'Pond!' to '!ping'
  else if (message.content.startsWith(settings.prefix + 'test')){
    message.channel.send(answer(message.author.id,message.author.username));
  }
  else if (message.content === settings.prefix + 'coin'){
    let x = Math.floor((Math.random() * 10) / 5);
    let coin = ['head', 'tail'];
      message.channel.send(coin[x] + ', ' + answer(message.author.id,message.author.username) + ', I hope its the result you wanted!');
  }//flips a coin for user

  else if (message.content.startsWith(settings.prefix + 'nickname')){
    if (message.author.id === settings.OwnerID){
      message.guild.member(bot.user).setNickname(argsresult);
      console.log(argsresult);
    } //let owner nickname bot
    else if(argsresult !== 'ssalogel' || 'ssalogei' || 'Ssalogel' || 'Ssalogei'){
      //message.member.setNickname(argsresult); //uncomment if you want users to nickname themselves
      message.guild.member(bot.user).setNickname(argsresult); //comment to prevent users from nicknaming the bot
      console.log(argsresult + ' ' + message.author.username);
    }else message.channel.send("That's my creator's name! ");

  }

  else if (message.content.startsWith (settings.prefix + 'choose')){
      let x = Math.floor(Math.random() * args.length);
      message.channel.send("I will decide for you, "+answer(message.author.id,message.author.username)+"!\n" + args[x]+"!");
  } //randomnly picks between the options

  else if (message.content === settings.prefix + 'help') {
      message.channel.send("!ping \n!coin : coinflip \n!choose option1 option2 option3 ... optionx : chooses for you!\n!roll #d#+# : will roll the dice combination!\n!nickname aName : nickname me!\n!temp ##c OR ##f :  will convert it to the other temperature scale") }

  else if (message.content.startsWith (settings.prefix + 'temp')) {
    let pattern = /(-?[0-9]+)([cf])/i;
    if (pattern.test(argsresult)){
      let tempTo = pattern.exec(argsresult);
      tempTo[1] = parseInt(tempTo[1]);
      if (tempTo[2] === 'c'||tempTo[2] === 'C'){
        message.channel.send(tempTo[0] + ' is ' + Math.round(tempTo[1]*1.8+32) + '°F! (~' + Math.round(tempTo[1]+273) + 'K)');
      } else if (tempTo[2] === 'f'||tempTo[2] === 'F'){ 
        message.channel.send(tempTo[0] + ' is ' + Math.round((tempTo[1]-32)/1.8) + '°C! (~' + Math.round((tempTo[1]+459)/1.8) + 'K)')
      }
    } else message.channel.send('I don\'t understand :(  Please ask me about ##C or ##F');
  }
  else if (message.content.startsWith(settings.prefix + 'roll')){
    let dice = args.join('');
    let pattern = /[0-9]+[d][0-9]+[\+|-]?[0-9]*/i;
    if(pattern.test(dice)){
      let diceReg = /([0-9]+)[d]([0-9]+)([\+|-]?)([0-9]*)/i;
      let diceArray = diceReg.exec(dice);
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
  }

  else if (message.content.startsWith(settings.prefix + 'setgame')){
    if(!argsresult){
      argsresult = null;
    }
      bot.user.setGame(argsresult);
  }
});

bot.login(settings.token);
