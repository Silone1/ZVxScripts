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
({
     require: ["chat", "theme", "com", "user", "server", "commands"],

     counter:null,


     loadModule: function ()
     {
         this.chat.registerFilter(this.autoFilter, this);

         this.counter = new Object;
     },


     autoFilter: function (src, msg, chan)
     {
         if (this.user.hasPerm(src, "PROTECTED")) return msg;
         var ip = sys.ip(src);

         if (! (ip in this.counter)) this.counter[ip] = 0;

         this.counter[ip]++;

         var bind = this.counter;

         sys.setTimer( function () {
                           bind[ip]--;
                       }, 2000, false);


         var l = msg.length;

         print(l);

         for (var i = 0; i*100 <= l; i++)
         {

             this.counter[ip]++;
             sys.setTimer( function () {
                               bind[ip]--;
                           }, 15000, false);

         }


         if (this.counter[ip] >= 25)
         {
             this.commands.tryCommand(this.server.SERVER, {name:"mute", args:[this.user.name(src)], flags: {ip:true, time: Math.round((+this.counter[ip])/5) + " minutes.", reason: "Anti spam counter is " +this.counter[ip]+ "."}}, chan);
             this.commands.tryCommand(this.server.SERVER, {name:"kick", args:[this.user.name(src)], flags: {reason: "Anti spam counter is " +this.counter[ip]+ "."}}, chan);
             return "";
         }

         if (this.counter[ip] >= 10)
         {
             this.com.message(src, "You are flooding, please message less.");
             return "";
         }

         if (this.counter[ip] >= 15)
         {
             this.commands.tryCommand(this.server.SERVER, {name:"kick", args:[this.user.name(src)], flags: {reason: "Anti spam counter is " +this.counter[ip]+ "."}}, chan);
             return "";
         }



         return msg;
     }


 });