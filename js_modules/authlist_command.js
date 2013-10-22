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

     require: ["commands", "text", "com", "theme", "util", "user"],

     LEVELS: null,

     LEVEL_ORDER: null,

     loadModule: function ()
     {
         this.commands.registerCommand("authlist", this);

         this.LEVELS = this.util.keyify([1, 2, 3]);
         this.LEVEL_ORDER = this.util.keyify([3,2,1,0]);
     },

     authlist:
     {
         desc: "Lists the auth on the server.",
         aliases: ["auths"],
         category: "basic",
         
         perm: function () { return true; }
         ,
         code: function (src)
         {
             this.com.message([src], "Authlist:", this.theme.INFO);
             var auths = sys.dbAuths();

             var lvs = [[],[],[],[]];

             for (var x in auths)
             {
                 var lv = void 0;

                 if (sys.id(auths[x])) lv = sys.auth(sys.id(auths[x]));
                 else lv = sys.dbAuth(auths[x]);

                 if ((""+lv) in this.LEVELS) lvs[lv].push(auths[x]);

                 else lvs[0].push(auths[x]);

             }

             lvs.forEach(
                 function (e)
                 {
                     e.sort();
                 }
             );

             for (var y in this.LEVEL_ORDER) for (x in lvs[y])
             {
                 this.com.message(src, "<b>" + ([null, "Moderator", "Admin", "Owner"][sys.dbAuth(lvs[y][x])] || "?") + "</b> " + this.text.escapeHTML(this.user.nameToProper(lvs[y][x])) +
                                  (sys.id(lvs[y][x])?" <span style='color:green'>online ("+sys.id(lvs[y][x])+")</span>":" <span style='color:red'>offline</span>"), this.theme.RAW, true);
             }

         }
     }
 });
