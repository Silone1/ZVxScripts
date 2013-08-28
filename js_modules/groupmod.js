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
     require: ["commands", "user", "theme", "com"],

     loadModule: function ()
     {
         this.commands.registerCommand("groupmod", this);
     },

     groupmod:
     {
         server: true,

         perm: function (src, cmd, chan)
         {
             return "USERMOD" in this.user.groups(src);
         },

         code: function (src, cmd, chan)
         {
             var x;

             var groups = this.user.groups(src);

             if (!cmd.flags.group)
             {
                 this.com.message(src, "Include a --group=<group> option.", this.theme.WARN);
                 return;
             }

             if (cmd.flags.add && !cmd.flags.drop)
             {
                 if (!(("GROUPMOD[" + cmd.flags.group + "]") in groups || "SERVEROP" in groups))
                 {
                     this.com.message(src, "You don't have permission to manage that group.");
                     return;
                 }

                 for (x in cmd.args)
                 {
                     if (sys.dbRegistered(cmd.args[x]))
                     {
                         this.user.database.usergroups[cmd.args[x]] = this.user.database.usergroups[cmd.args[x]] || [];

                         var a = this.user.database.usergroups[cmd.args[x]];

                         if (a.indexOf(cmd.flags.group) === -1)
                         {
                             a.push(cmd.flags.group);
                             this.com.broadcast(this.user.name(src) + " set " +  cmd.flags.group  + " for " + cmd.args[x] + ".", this.theme.INFO);
                         }
                         else
                         {
                             this.com.message(src, "User is already in that group.");
                         }
                     } else this.com.message(src, "Unregistered users are uneligible for group membership.", this.theme.WARN);
                 }
             }
             else if (!cmd.flags.add && cmd.flags.drop)
             {
                 if (!(("GROUPMOD[" + cmd.flags.group + "]") in groups || "SERVEROP" in groups))
                 {
                     this.com.message(src, "You don't have permission to manage that group.", this.theme.WARN);
                     return;
                 }

                 for (x in cmd.args)
                 {
                     if (sys.dbRegistered(cmd.args[x]))
                     {
                         this.user.database.usergroups[cmd.args[x]] = this.user.database.usergroups[cmd.args[x]] || [];

                         var a = this.user.database.groups[cmd.args[x]];

                         if (a.indexOf(cmd.flags.group) !== -1)
                         {
                             a.splce(a.indexOf(cmd.flags.group), 1);
                             this.com.broadcast(this.user.name(src) + " removed " +  cmd.flags.group  + " for " + cmd.args[x] + ".", this.theme.INFO);
                         }
                         else
                         {
                             this.com.message(src, "User is not in that group.", this.theme.WARN);
                         }
                     } else this.com.message(src, "Unregistered users are uneligible for group membership.", this.theme.WARN);
                 }
             }
         }
     }
 });