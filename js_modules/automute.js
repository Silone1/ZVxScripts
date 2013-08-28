/*  ///////////////////////// LEGAL NOTICE ///////////////////////////////

 This file is part of ZScripts,
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
     require: ["chat", "theme", "com", "user"],

     counter:null,


     loadModule: function ()
     {
         this.chat.registerFilter(this.autoFilter, this);

         this.counter = new Object;
     },


     autoFilter: function (src, msg)
     {
         if ("SERVEROP" in this.user.groups(src)) return msg;
         var ip = sys.ip(src);

         if (! (ip in this.counter)) this.counter[ip] = 0;

         this.counter[ip] += 2;

         var bind = this.counter;

         sys.setTimer( function () {
                           bind[ip]--;
                       }, 2000, false);

         sys.setTimer( function () {
                           bind[ip]--;
                       }, 15000, false);

         if (this.counter[ip] >= 10)
         {
             this.com.message(src, "You are flooding, please message less.");
             return "";
         }
         else if (this.counter[ip] >= 15)
         {
             this.com.broadcast("~Script~ has kicked " + sys.name(src) + "! Reason: Flood", this.theme.WARN);
             sys.kick(src);
             return "";
         }

         return msg;
     }


 });