/*  ///////////////////////// LEGAL NOTICE ///////////////////////////////

 This file is part of ZVxScripts,
 a modular script framework for Pokemon Online server scripting.

 Copyright (C) 2013  Ryan P. Nicholl, aka "ArchZombie" / "ArchZombie0x", <archzombielord@gmail.com>

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 /////////////////////// END LEGAL NOTICE /////////////////////////////// */
/** Implements channels
 * @name channels
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.channels */
({
     require: ["io", "user", "commands", 'theme', "logs", 'theme', "com", "chat", 'util'],

     meta:
     {
         commands: ["channelregister", "channeltopic", "channelban", "channelunban", "channelunmute", "channelauth", "channelmute", "channelctrl", "channelinfo"]
     },

     /** The chans property stores channel databases. Key is channel permanent ID. */
     chans: null,

     /** ChanDB keeps track of the IDs of channel databases */
     /* Example:

      chanDB: {
      chans:
      {
      "indigo pleateu": 2,
      "watch": 3,
      "testchan": 9,
      ...
      },
      counter: 10
      },

      */
     chanDB: null
     ,
     /** Active channels associates channel IDs with channel objects, currently unused. */
     activeChannels: null
     ,
     loadModule: function ()
     {
         this.chanDB = this.io.registerDB(this, "channels");
         this.chans = new Object;
         this.chanDB.counter || (this.chanDB.counter = 1);
         this.chanDB.chans || (this.chanDB.chans = new Object);
         this.activeChannels = new Object;
         this.script.registerHandler("beforeChannelCreated", this);
         this.script.registerHandler("beforeChannelJoin", this);
         this.script.registerHandler("afterChannelJoin", this);
         this.script.registerHandler("beforeChannelDestroyed", this);

         this.chat.registerFilter(this.chanMuteFilter, this);
     }
     ,
     unloadModule: function ()
     {
         for (var x in this.chans)
         {
             try
             {
                 this.io.closeDB("channels$c"+x);
             }
             catch(e)
             {
                 this.script.error(e);
             }
         }
     }
     ,
     /** Opens a chan DB if it exists
      * @event
      */
     beforeChannelCreated: function (id, name, src)
     {
         this.activeChannels[id] = this.channelObj(id, name);
     },



     channelregister:
     {
         desc: "Register an un-owned channel in your name.",
         category: "channel",
         aliases: ["cregister"],
         perm: "CHANNEL[REGISTER]",
         code: function (src, cmd, chan)
         {
             var cobj;

             if (chan == -1 || (this.channelObj(chan) && !this.user.hasPerm(src, "CHANNEL[OVERRIDE]")))
             {
                 this.com.message(src, "That channel is already registered!", this.theme.ERROR);
                 return;
             }

             if (chan == 0)
             {
                 this.com.message(src, "That channel is not registerable!", this.theme.ERROR);
                 return;
             }

             cobj = this.channelRegister(chan);

             cobj.owner = this.user.name(src).toLowerCase();
             cobj.auth = new Object;
             cobj.bans = new Object;
             cobj.mutes = new Object;
             cobj.registeredAt = +new Date;

	     this.com.broadcast(this.user.name(src) + " registered #" + sys.channel(chan) + "!");


         }
     },

     channeltopic:
     {
         desc: "Modifies a channel's topic.",
         category: "channel",
         aliases: ["ctopic"],
         perm: function (src, cmd, chan)
         {
             return this.user.hasPerm(src, "CHANNEL[OVERRIDE]") || (this.user.hasPerm(src, "CHANNEL[MODERATE]"));
         },
         code: function (src, cmd, chan)
         {
             var cobj, lname;

             if (cmd.flags.chan && sys.channelId(cmd.flags.chan))
             {
                 chan = sys.channelId(cmd.flags.chan);
             }

             cobj = this.channelObj(chan);

             if (chan == 0 || !cobj || chan == -1)
             {
                 this.com.message(src, "That channel is not registered!", this.theme.ERROR);
                 return;
             }

             lname = this.user.name(src).toLowerCase();

             if (!cmd.input)
             {
                 this.com.message(src, "Channel Topic: " + cobj.topic);
                 return;
             }

             // Note: auth comparison statement is order sensitive in the undefined case.
             if (!this.user.hasPerm(src, "CHANNEL[OVERRIDE]") && lname !== cobj.owner && !( 2 <= cobj.auth[lname] ))

             {
                 this.com.message(src, "You are not high enough auth in that channel.", this.theme.ERROR);
                 return;
             }

             cobj.topic = cmd.input;

             this.com.broadcast(this.user.name(src) + " changed the topic for " + sys.channel(chan) + "!", this.theme.INFO, false, chan);
             this.com.broadcast("Channel Topic: " + cobj.topic, this.theme.INFO, false, chan);


         }
     },

     channelinfo:
     {
         aliases: ["cinfo"],
         category: "channel",
         desc: "Returns information about a channel",
         perm: function ()
         {
             return true;
         },

         code: function (src, cmd, chan)
         {
             var cobj = this.channelObj(chan);

             if (chan == 0 || chan == -1 || !cobj)
             {
                 this.com.message(src, "That channel is not registered.", this.theme.ERROR, false, chan);
                 return;
             }


             var modes = [];

             if (cobj.voiceOnly) modes.push("+silent");
             if (cobj.memberOnly) modes.push("+private");
             if (cobj.perm) modes.push("+permanent");

             this.com.message(src, "Info:\nOwner: " + cobj.owner + "\nTopic: " + cobj.topic + "\nMode(s): " + (modes.join(" ") || "+default"));
         }
     },

     channelctrl:
     {
         desc: "Modifies a channel's mode options.",
         category: "channel",
         examples:
         [
             [{flags:{perm:true}, args: []}, "Makes the channel permanent."]
         ],
         options:
         {
             "private": "Only voiced members may join.",
             silent: "Only voiced members may talk.",
             permanent: "Channel will not be closed."
         },
         aliases: ["cctrl"],
         perm: function (src, cmd, chan)
         {
             return this.user.hasPerm(src, "CHANNEL[OVERRIDE]") || (this.user.hasPerm(src, "CHANNEL[MODERATE]"));
         },
         code: function (src, cmd, chan)
         {
             var cobj, lname;

             if (cmd.flags.chan && sys.channelId(cmd.flags.chan))
             {
                 chan = sys.channelId(cmd.flags.chan);
             }

             cobj = this.channelObj(chan);

             if (chan == 0 || !cobj || chan == -1)
             {
                 this.com.message(src, "That channel is not registered!", this.theme.ERROR);
                 return;
             }

             lname = this.user.name(src).toLowerCase();

             // Note: auth comparison statement is order sensitive in the undefined case.
             if (!this.user.hasPerm(src, "CHANNEL[OVERRIDE]") && lname !== cobj.owner && !( 3 <= cobj.auth[lname] ))

             {
                 this.com.message(src, "You are not high enough auth in that channel.", this.theme.ERROR);
                 return;
             }

             if (cmd.flags.perm && !this.user.hasPerm(src, "CHANNEL[PERM]"))
             {
                 this.com.message(src, "You don't have permission to use the perm option");
                 delete cmd.flags.perm;
             }

             cobj.voiceOnly = !!(cmd.flags.mute || cmd.flags.silent);
             cobj.memberOnly = !!(cmd.flags.invite || cmd.flags.inviteonly || cmd.flags["private"] ||cmd.flags.prot || cmd.flags.protect);
             cobj.perm = !!(cmd.flags.perm);

             if (cmd.flags.topic || cmd.flags.motd)
             {
                 cobj.topic = cmd.flags.topic || cmd.flags.motd;
             }

             var modes = [];

             if (cobj.voiceOnly) modes.push("+silent");
             if (cobj.memberOnly) modes.push("+private");
             if (cobj.perm) modes.push("+permanent");


             this.com.broadcast(this.user.name(src) + " set mode "+ (modes.join(" ") || "+default") + " for #" + sys.channel(chan) + "!", this.theme.INFO, false, chan);


         }
     },

     channelunban:
     {
         desc: "Unbans a user(s) from channel",
         category: "channel",
         aliases: ["cunban"],
         perm: function (src, cmd, chan)
         {
             return this.user.hasPerm(src, "CHANNEL[OVERRIDE]") || (this.user.hasPerm(src, "CHANNEL[MODERATE]"));
         },
         code: function (src, cmd, chan)
         {
             var cobj, lname;

             if (cmd.flags.chan && sys.channelId(cmd.flags.chan))
             {
                 chan = sys.channelId(cmd.flags.chan);
             }

             cobj = this.channelObj(chan);

             if (chan == 0 || !cobj || chan == -1)
             {
                 this.com.message(src, "That channel is not registered!", this.theme.ERROR);
                 return;
             }

             lname = this.user.name(src).toLowerCase();

             // Note: auth comparison statement is order sensitive in the undefined case.
             if (!this.user.hasPerm(src, "CHANNEL[OVERRIDE]") && lname !== cobj.owner && !( 3 <= cobj.auth[lname] ))

             {
                 this.com.message(src, "You are not high enough auth in that channel.", this.theme.ERROR);
                 return;
             }

             for (var x in cmd.args)
             {
                 delete cobj.bans[cmd.args[x].toLowerCase()];

                 this.com.broadcast(this.user.name(src) + " has unbanned " + cmd.args[x] + " in #" + sys.channel(chan) + "!", this.theme.INFO, false, chan);

             }


         }
     },

     channelban:
     {
         desc: "Bans a user(s) from channel.",
         aliases: ["cban"],
         category: "channel",
         perm: function (src, cmd, chan)
         {
             return this.user.hasPerm(src, "CHANNEL[OVERRIDE]") || (this.user.hasPerm(src, "CHANNEL[MODERATE]"));
         },
         code: function (src, cmd, chan)
         {
             var cobj, lname;

             if (cmd.flags.chan && sys.channelId(cmd.flags.chan))
             {
                 chan = sys.channelId(cmd.flags.chan);
             }

             cobj = this.channelObj(chan);

             if (chan == 0 || !cobj || chan == -1)
             {
                 this.com.message(src, "That channel is not registered!", this.theme.ERROR);
                 return;
             }

             lname = this.user.name(src).toLowerCase();

             // Note: auth comparison statement is order sensitive in the undefined case.
             if (!this.user.hasPerm(src, "CHANNEL[OVERRIDE]") && lname !== cobj.owner && !( 3 <= cobj.auth[lname] ))

             {
                 this.com.message(src, "You are not high enough auth in that channel.", this.theme.ERROR);
                 return;
             }

             for (var x in cmd.args)
             {
                 cobj.bans[cmd.args[x].toLowerCase()] = true;

                 this.com.broadcast(this.user.name(src) + " has banned " + cmd.args[x] + " in #" + sys.channel(chan) + "!", this.theme.CRITICAL, false, chan);

                 var id = sys.id(cmd.args[x]);

                 if (id && !this.user.hasPerm(id, "PROTECTED"))
                 {
                     sys.kick(id, chan);
                 }

             }


         }
     },


     channelmute:
     {
         aliases: ["cmute"],
         category: "channel",
         perm: function (src, cmd, chan)
         {
             return this.user.hasPerm(src, "CHANNEL[OVERRIDE]") || (this.user.hasPerm(src, "CHANNEL[MODERATE]"));
         },
         code: function (src, cmd, chan)
         {
             var cobj, lname;

             if (cmd.flags.chan && sys.channelId(cmd.flags.chan))
             {
                 chan = sys.channelId(cmd.flags.chan);
             }

             cobj = this.channelObj(chan);

             if (chan == 0 || !cobj || chan == -1)
             {
                 this.com.message(src, "That channel is not registered!", this.theme.ERROR);
                 return;
             }

             lname = this.user.name(src).toLowerCase();

             // Note: auth comparison statement is order sensitive in the undefined case.
             if (!this.user.hasPerm(src, "CHANNEL[OVERRIDE]") && lname !== cobj.owner && !( 2 <= cobj.auth[lname] ))

             {
                 this.com.message(src, "You are not auth in that channel.", this.theme.ERROR);
                 return;
             }

             for (var x in cmd.args)
             {
                 cobj.mutes[cmd.args[x].toLowerCase()] = true;

                 this.com.broadcast(this.user.name(src) + " has muted " + cmd.args[x] + " in #" + sys.channel(chan) + "!", this.theme.CRITICAL, false, chan);

             }


         }
     },

     channelunmute:
     {
         desc: "Unmutes a user in a channel",
         category: "channel",
         aliases: ["cunmute"],
         perm: function (src, cmd, chan)
         {
             return this.user.hasPerm(src, "CHANNEL[OVERRIDE]") || (this.user.hasPerm(src, "CHANNEL[MODERATE]"));
         },
         code: function (src, cmd, chan)
         {
             var cobj, lname;

             if (cmd.flags.chan && sys.channelId(cmd.flags.chan))
             {
                 chan = sys.channelId(cmd.flags.chan);
             }

             cobj = this.channelObj(chan);

             if (chan == 0 || !cobj || chan == -1)
             {
                 this.com.message(src, "That channel is not registered!", this.theme.ERROR);
                 return;
             }

             lname = this.user.name(src).toLowerCase();

             // Note: auth comparison statement is order sensitive in the undefined case.
             if (!this.user.hasPerm(src, "CHANNEL[OVERRIDE]") && lname !== cobj.owner && !( 2 <= cobj.auth[lname] ))

             {
                 this.com.message(src, "You are not auth in that channel.", this.theme.ERROR);
                 return;
             }

             for (var x in cmd.args)
             {
                 delete cobj.mutes[cmd.args[x].toLowerCase()];

                 this.com.broadcast(this.user.name(src) + " has unmuted " + cmd.args[x] + " in #" + sys.channel(chan) + ".", this.theme.INFO, false, chan);

             }


         }
     },

     channelauth:
     {
         desc: "Sets auth for a user(s) in a channel.",
         category: "channel",
         examples:
         [
             [{ args: ["User name"], flags: {level:"voice"}}, "Makes 'User name' a voiced member of the channel."]
         ],
         aliases: ["cauth"],
         server: true,
         perm: function (src, cmd, chan)
         {
             var c = this.channelObj(chan);

             if (!c) return false;

             return true;
         },
         code: function (src, cmd, chan)
         {
             var level, x, lname;

             if (cmd.flags.chan && sys.channelId(cmd.flags.chan))
             {
                 chan = sys.channelId(cmd.flags.chan);
             }

             if (chan == 0 || !cobj || chan == -1)
             {
                 this.com.message(src, "That channel is not registered!", this.theme.ERROR);
                 return;
             }

             lname = this.user.name(src).toLowerCase();

             // Note: auth comparison statement is order sensitive in the undefined case.
             if (!this.user.hasPerm(src, "CHANNEL[OVERRIDE]") && lname !== cobj.owner && !( 2 <= cobj.auth[lname] ))

             {
                 this.com.message(src, "You are not auth in that channel.", this.theme.ERROR);
                 return;
             }

             if (!("level" in cmd.flags))
             {
                 this.com.message(src, "Please provide a level option! Type /help channelauth !");
                 return;
             }

             level = {
                 "0":0, user:0, "normal":0,
                 "1":1, voice: 1, member:1, "true":1,
                 "2":2, moderator:2, mod:2,
                 "3":3, admin:3, administrator:3
             }[String(cmd.flags.level).toLowerCase()];

             if (level === undefined)
             {
                 this.com.message(src, "Level must be user, voice, moderator, or admin!");
                 return;
             }

             for (x in cmd.args)
             {
                 if (level === 0)
                 {
                     delete cobj.auth[cmd.args[x].toLowerCase()];

                     this.com.broadcast(this.user.name(src) + " has removed " + cmd.args[x] + " from channel membership in #" + sys.channel(chan) + ".", this.theme.INFO, false, chan);
                 }
                 else
                 {
                     cobj.auth[cmd.args[x].toLowerCase()] = level;

                     this.com.broadcast(this.user.name(src) + " has made " + cmd.args[x] + " "+({"1":"voiced", "2":"a moderator", "3":"an administrator"}[level])+" in #" + sys.channel(chan) + ".", this.theme.INFO, false, chan);
                 }
             }
         }
     },



     /** Registers the channel. Primitive at the moment.
      * @param id Channel to register
      */
     channelRegister: function (id)
     {
         var chanNameLw = sys.channel(id).toLowerCase();

         if (!this.chanDB.chans[chanNameLw])
         {
             this.chanDB.chans[chanNameLw] = this.chanDB.counter++;
             //  this.io.markDB("channels");
         }

         var chanid = this.chanDB.chans[chanNameLw];

         this.chans[chanid] = this.io.openDB("channels$c" + chanid);

         return this.chans[chanid];
     },
     /** Returns a channel object for chan, or null if not registered.
      * @param {Number} chan The channel ID.
      * @return {Object|Null} The associated channel database.
      */
     channelObj: function (chan, name)
     {
         if(chan == 0 || chan == -1) return null;

         var chanNameLw = (name || sys.channel(chan)).toLowerCase();

         if (!this.chanDB.chans[chanNameLw]) return null;


         var chanid = this.chanDB.chans[chanNameLw];

         this.chans[chanid] || (this.chans[chanid] = this.io.openDB("channels$c" + chanid));;

         return this.chans[chanid];
     }
     ,
     /** Close the channel from the channel databases
      * @event
      * @param {Number} chan Channel ID.
      *  */
     beforeChannelDestroyed: function (chan)
     {
         var chanNameLw = sys.channel(chan).toLowerCase();

         var chanid = this.chanDB.chans[chanNameLw];

         if (!chanid) return;

         if (this.chans[chanid])
         {
             if (this.chans[chanid].perm)
             {
                 sys.stopEvent();
                 return;
             }
             this.io.closeDB("channels$c" + chanid);
             delete this.chans[chanid];

             return;
         }
     },
     beforeChannelJoin: function (src, chan)
     {
         var co = this.channelObj(chan);

         if (!co) return;

         var uname = this.user.name(src).toLowerCase();

         if (uname in co.bans && !this.user.hasPerm(src, "PROTECTED") && !this.user.hasPerm(src, "CHANNEL[PROTECTED]")  && uname !== co.owner && !(uname in co.auth) )
         {
             this.com.message(src, "You are banned from that channel.", this.theme.CRITICAL);
             sys.stopEvent();
             return;
         }

         if (co.memberOnly && !this.user.hasPerm(src, "PROTECTED") && !this.user.hasPerm(src, "CHANNEL[PROTECTED]")  && uname !== co.owner && !(uname in co.auth))
         {
             this.com.message(src, "Channel is members-only.");
             sys.stopEvent();
             return;
         }



     },

     afterChannelJoin: function (src, chan)
     {
         var co = this.channelObj(chan);

         if (!co) return;

         if (co.topic)
         {
             this.com.message(src, "Channel Topic: " + co.topic, this.theme.INFO, false, chan);
         }
     },
     chanMuteFilter: function (src, msg, chan)
     {
         var cobj = this.channelObj(chan);
         var uname = this.user.name(src).toLowerCase();

         if (!cobj) return msg;

         if (this.user.hasPerm(src, "PROTECTED") || this.user.hasPerm(src, "CHANNEL[PROTECTED]") || uname === cobj.owner || uname in cobj.auth) return msg;

         if (uname in cobj.mutes)
         {
             this.com.message(src, "You are muted in that channel.");
             return "";
         }

         if (cobj.voiceOnly)
         {
             this.com.message(src, "You are not voice in that channel.");
             return "";
         }


         return msg;
     }
 });
