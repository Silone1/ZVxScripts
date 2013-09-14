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
     require: ["commands", "com", "theme", "user", "text"],

     kick:
     {
         server: true,

         desc: "Kicks user(s) off the server",

         options:
         {
             "force": "Allows a root level administrator to kick users normally immune to kick.",

             silent: "Does not display a message, can only be used by high level admins.",

             "reason": "Reason for the kick."
         },


         perm: function (src)
         {
             return "KICKOP" in this.user.groups(src);
         }
         ,
         code: function (src, cmd)
         {
             var kicklist = [];
             var groups = this.user.groups(src);
             var kicknameslist = [];
             var sys_auth$src = (src == 0 ? 3 : sys.auth(src));

             for (var x in cmd.args)
             {
                 var i = sys.id(cmd.args[x]);



                 if (!i)
                 {
                     this.com.message([src], "Cant find user: " + cmd.args[x], this.theme.WARN);
                     continue;
                 }

                 var tg = this.user.groups(i);

                 if (("PROTECTED" in tg || "SERVEROP" in tg) && !(("OVERRIDE" in groups || "SERVEROP" in groups) && (cmd.flags.f || cmd.flags.force)))
                 {
                     this.com.message([src], "User is immune to kick.", this.theme.WARN);
                     continue;
                 }

                 kicklist.push(i);
                 kicknameslist.push(cmd.args[x]);
             }

             if (kicklist.length == 0) return;

             if (!cmd.flags.silent || sys_auth$src != 3)
             {
                 this.com.broadcast(this.user.name(src) + " kicked " + kicknameslist.join(", ") + "!" +
                                    (cmd.flags.reason ? " (Reason: " + cmd.flags.reason + ")" : String() ), this.theme.CRITICAL);
             }

             for (x in kicklist)
             {
                 sys.kick(kicklist[x]);
             }
         }
     }
     ,
     loadModule: function ()
     {
         this.commands.registerCommand("kick", this);
     }
 });
