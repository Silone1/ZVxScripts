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
     require: ["io", "user", "logs", 'theme', "com", "chat"],

     /** The chans property stores channel databases. Key is channel permanent ID. */
     chans: null,

     /** ChanDB keeps track of the file names of channel databases */
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
         this.script.registerHandler("beforeChannelDestroyed", this);

         this.chat.registerFilter(this.chanMuteFilter, this);
     }
     ,
     unloadModule: function ()
     {
     }
     ,
     /** Opens a chan DB if it exists
      * @event
      */
     beforeChannelCreated: function (id, name, src)
     {
         this.activeChannels[id] = this.channelObj(id, name);
     }
     ,
     /** Registers the channel. Primitive at the moment.
      * @param id Channel to register
      */
     channelRegister: function (id)
     {
         var chanNameLw = sys.channel(id).toLowerCase();

         if (!this.chanDB.chans[chanNameLw])
         {
             this.chanDB.chans[chanNameLw] = this.chanDB.counter++;
             this.io.markDB("channels");
         }

         var chanid = this.chanDB.chans[chanNameLw];

         this.chans[chanid] = this.io.openDB("channels$c" + chanid);

         return;
     }
     ,
     /** Returns a channel object for chan, or null if not registered.
      * @param {Number} chan The channel ID.
      * @return {Object|Null} The associated channel database.
      */
     channelObj: function (chan, name)
     {
         this.logs.logMessage(this.logs.DEBUG, "chan1");
         var chanNameLw = (name || sys.channel(chan)).toLowerCase();

         if (!this.chanDB.chans[chanNameLw]) return null;

         this.logs.logMessage(this.logs.DEBUG, "chan1");
         var chanid = this.chanDB.chans[chanNameLw];

         this.chans[chanid] || (this.chans[chanid] = this.io.registerDB("channels$c" + chanid));;

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
             this.io.closeDB("channels$c" + chanid);
             delete this.chans[chanid];

             return;
         }
     }
     ,
     beforeChannelJoin: function (src, chan)
     {
         var co = this.channelObj(chan);

         var uname = this.user.name(src).toLowerCase();
/*
         var pid = this.profile.profileID(src);

         if (sys.auth(src) == 0 && uname !== co.owner && !(uname in co.auth) && uname in co.bans)
         {
             this.com.message(src, "You are banned from that channel.", this.theme.CRITICAL);
             sys.stopEvent();
             return;
         }

         if (co.motd)
         {
             this.com.message(src, "MOTD: " + co.motd, this.theme.INFO, false, chan);
         }*/

     }
     ,
     chanMuteFilter: function (src, msg, chan)
     {
         var cobj = this.channelObj(chan);
         var uname = this.user.name(src).toLowerCase();

         if (!cobj) return msg;

         if (sys.auth(src) > 0 || uname === cobj.owner || uname in cobj.auth) return msg;

         if (uname in cobj.mutes)
         {
             this.com.message(src, "You are muted in that channel.");
             return "";
         }

         return msg;
     }
 });
