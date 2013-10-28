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
     require: ["sched", "io", "com", "user", "theme", "util", "text"],

     database: null,

     loadModule: function ()
     {
         this.database = this.io.registerDB(this, "security.2");

         this.script.registerHandler("beforeLogIn", this);
         this.script.registerHandler("afterChangeTeam", this);

         this.database.bans = this.database.bans || new Object;
         this.database.mutes = this.database.mutes || new Object;

         this.database.muteCtr = this.database.muteCtr || 0;

         this.database.banCtr = this.database.banCtr || 0;

     },

     chk: function ()
     {
         var q = this.user.users();

         if (this.script.modules.gateway) for (var x in q)
         {
             this.script.modules.gateway.checkUser(q[x]);
         }
     },

     parseAfflictedArgs: function (args)
     {

     },


     afflicted: function (src, object, expire)
     {
         var lname, ip, now;

         now = +new Date;
         ip = (src == 0? "0.0.0.0" : sys.ip(src));

         lname = this.user.name(src).toLowerCase();

        // if (this.user.hasPerm(src, "PROTECTED")) return null;

         for (var x in object)
         {
             var ban = object[x];
             if (ban.expires && ban.expires !== true && ban.expires <= now)
             {
                 if (expire) expire(x);
                 delete object[x];

                 continue;
             }

             if (ban.names) for (var x2 in ban.names)
             {
                 if (lname == ban.names[x2].toLowerCase())
                 {
                     return x;
                 }

             }

             if (ban.nameRegex) for (var x2 in ban.nameRegex)


             {
                 var m = ban.nameRegex[x2].match(/^\/(.+)\/(\w*)$/);
                 if (lname.match(new RegExp(m[1], m[2])))
                     return x;

             }

             if (ban.ips) for (var x2 in ban.ips)
             {
                 if (ip == ban.ips[x2]) return x;
             }

             if (ban.subnets) for (var x2 in ban.subnets)
             {
                 if (this.util.ipMatchesSubnet(ip, ban.subnets[x2]))
                 {
                     return x;

                 }

             }
         }

         return null;
     },

     prune: function (object)
     {
         var k = Object.keys(object);
         for (var i in k)
         {
             var x = k[i];
             if (object[x].expires && +new Date >= object.expires) delete object[x];
         }
     },

     removeAfflicted: function (param, object)
     {
         var lname, ip;

         var rs = [];

         lname = param.toLowerCase();


         loop1: for (var x in object)
         {
             if (lname.match(/^#\d+$/) && x === lname.match(/^#(\d+)$/)[1])
             {
                 rs.push(x);
                 delete object[x];
                 continue loop1;
             }
             var ban = object[x];


             if (ban.names) for (var x2 in ban.names)
             {
                 if (lname == ban.names[x2].toLowerCase())
                 {
                     rs.push(x);
                     delete object[x];
                     continue loop1;
                 }

             }

             if (ban.nameRegex) for (var x2 in ban.nameRegex)


             {
                 var m = ban.nameRegex[x2].match(/^\/(.+)\/(\w+)$/);
                 if (lname.match(new RegExp(m[1], m[2])) || param == ban.nameRegex[x2])
                 {
                     rs.push(x);
                     delete object[x];
                     continue loop1;
                 }

             }

             if (ban.ips) for (var x2 in ban.ips)
             {
                 if (param == ban.ips[x2])
                 {
                     rs.push(x);
                     delete object[x];
                     continue loop1;
                 }
             }

             if (ban.subnets) for (var x2 in ban.subnets)
             {
                 if (param == ban.subnets[x2] || (param.match(/\d+\.\d+\.\d+\.\d+/) && this.util.ipMatchesSubnet(param, ban.subnets[x2])))
                 {
                     rs.push(x);
                     delete object[x];
                     continue loop1;
                 }

             }
         }

         return rs;
     },

     banID: function (src)
     {
         return this.afflicted(src, this.database.bans);
     },

     muteID: function (src)
     {
         return this.afflicted (src, this.database.mutes);
     },

     beforeLogIn: function (src)
     {
         var name = this.user.name(src);

         if (name.match(/\d+\.\d+.\d+\.\d+/) || name.match(/\//))
         {
             this.com.message(src, "Illegal name.", this.theme.CRITICAL);
             sys.stopEvent();
             return;
         }
     },

     afterChangeTeam: function (src)
     {

         var name = this.user.name(src);

         if (name.match(/\d+\.\d+.\d+\.\d+/) || name.match(/\//))
         {
             this.com.message(src, "Illegal name.", this.theme.CRITICAL);
             sys.kick(src);
             return;
         }
     }

 });
