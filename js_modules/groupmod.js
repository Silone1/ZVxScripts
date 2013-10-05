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
     require: ["commands", "user", "theme", "com"],

     loadModule: function ()
     {
         this.commands.registerCommand("usermod", this);
         this.commands.registerCommand("permmod", this);
         this.commands.registerCommand("groupmod", this);
     },

     usermod:
     {
         server: true,

         desc: "Adds or removes users from MajorGroups.",

         options:
         {
             group: "What group to add/remove the user(s) to.",
             add: "Add users.",
             drop: "Drop users."
         },

         perm: function (src, cmd, chan)
         {
             return this.user.hasPerm(src, "USERMOD");
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

             if (!this.user.majorGroupExists(cmd.flags.group))
             {
                 return;
             }

             if (cmd.flags.add && !cmd.flags.drop)
             {
                 if (! this.user.hasPerm(src, "USERMOD[" + cmd.flags.group.toUpperCase() + "]"))
                 {
                     this.com.message(src, "You don't have permission to manage that group.");
                     return;
                 }

                 for (x in cmd.args)
                 {
                     if (sys.dbRegistered(cmd.args[x]))
                     {
                         var lname = cmd.args[x].toLowerCase();

                         if (this.user.majorGroupAddMemberName(cmd.flags.group, cmd.args[x]))
                         {
                             this.com.broadcast(this.user.name(src) + " added " + cmd.args[x] + " to the " +  cmd.flags.group  + " group.", this.theme.INFO);
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
                 if (! this.user.hasPerm(src, "USERMOD[" + cmd.flags.group.toUpperCase() + "]"))
                 {
                     this.com.message(src, "You don't have permission to manage that group.", this.theme.WARN);
                     return;
                 }

                 for (x in cmd.args)
                 {
                     if (sys.dbRegistered(cmd.args[x]))
                     {
                         var lname = cmd.args[x].toLowerCase();

                         if (this.user.majorGroupDropMemberName(cmd.flags.group, cmd.args[x]))
                         {
                             this.com.broadcast(this.user.name(src) + " removed " + cmd.args[x] + " from the " +  cmd.flags.group  + " group.", this.theme.INFO);
                         }
                         else
                         {
                             this.com.message(src, "User not in that group.");
                         }
                     } else this.com.message(src, "Unregistered users are uneligible for group membership.", this.theme.WARN);
                 }
             }
         }
     },

     permmod:
     {
         server: true,

         desc: "Modifies MinorGroups directly. Normally you will want to use MajorGroups instead of this command. As each change is manual, this command can make your server difficult to manage.",

         perm: function (src, cmd, chan)
         {
             return this.user.hasPerm(src, "PERMMOD");
         },

         code: function (src, cmd, chan)
         {
             var x;

             var groups = this.user.groups(src);

             if (!cmd.flags.perm)
             {
                 this.com.message(src, "Include a --perm=<permgroup> option.", this.theme.WARN);
                 return;
             }

             if (cmd.flags.add && !cmd.flags.drop)
             {
                 if (! this.user.hasPerm(src, "PERMMOD[" + cmd.flags.perm.toUpperCase() + "]"))
                 {
                     this.com.message(src, "You don't have permission to manage that group.");
                     return;
                 }

                 for (x in cmd.args)
                 {
                     if (sys.dbRegistered(cmd.args[x]))
                     {
                         var lname = cmd.args[x].toLowerCase();

                         this.user.database.usergroups[lname] = this.user.database.usergroups[lname] || [];

                         var a = this.user.database.usergroups[lname];


                         if (a.indexOf(cmd.flags.perm) === -1)
                         {
                             a.push(cmd.flags.perm);
                             this.com.broadcast(this.user.name(src) + " added " + cmd.args[x] + " to the " +  cmd.flags.perm  + " permission group.", this.theme.INFO);
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
                 if (! this.user.hasPerm(src, "PERMMOD[" + cmd.flags.perm.toUpperCase() + "]"))
                 {
                     this.com.message(src, "You don't have permission to manage that minorgroup.", this.theme.WARN);
                     return;
                 }

                 for (x in cmd.args)
                 {
                     if (sys.dbRegistered(cmd.args[x]))
                     {
                         var lname = cmd.args[x].toLowerCase();

                         this.user.database.usergroups[lname] = this.user.database.usergroups[lname] || [];

                         var a = this.user.database.usergroups[lname];

                         if (a.indexOf(cmd.flags.perm) !== -1)
                         {
                             a.splice(a.indexOf(cmd.flags.perm), 1);
                             this.com.broadcast(this.user.name(src) + " removed " + cmd.args[x] + " from the " +  cmd.flags.perm  + " permission group.", this.theme.INFO);
                         }
                         else
                         {
                             this.com.message(src, "User is not in that group.", this.theme.WARN);
                         }
                     } else this.com.message(src, "Unregistered users are uneligible for group membership.", this.theme.WARN);
                 }
             }
         }
     },


     groupmod:
     {
         perm: "GROUPMOD",

         code: function (src, cmd, chan)
         {
             if (!cmd.flags.group)
             {
                 this.com.message(src, "Must specify group option.");
                 return;
             }

             var group = cmd.flags.group;



             if (!this.user.majorGroupExists(group))
             {
                 if (!cmd.flags.create)
                 {
                     this.com.message(src, "Group does not exist.");
                     return;
                 }
                 else
                 {
                     this.user.createMajorGroup(group);
                     this.com.broadcast(this.user.name(src) + " created the " + group + " group!");
                 }
             }
             else if (cmd.flags["delete"])
             {
                 this.user.deleteMajorGroup(group);
                 this.com.broadcast(this.user.name(src) + " deleted the " + group + " group!");
                 return;
             }

             if (cmd.flags.addperms)
             {
                 this.com.broadcast(this.user.name(src) + " modified the " + group + " group by adding permissions: " + cmd.flags.addperms);
                 this.user.majorGroupAddPerms(group, cmd.flags.addperms.split(/,/g));
             }

             if (cmd.flags.dropperms)
             {
                 this.com.broadcast(this.user.name(src) + " modified the " + group + " group by dropping permissions: " + cmd.flags.dropperms);
                 this.user.majorGroupDropPerms(group, cmd.flags.perms.split(/,/g));
             }


             if (cmd.flags.inherits)
             {
                 this.com.broadcast(this.user.name(src) + " modified the " + group + " group by setting the inhertance prototype to: " + cmd.flags.inherits);
                 this.user.majorGroupInheritsSet(group, cmd.flags.inherits.split(/,/g));
             }

             if (cmd.flags.add)
             {
                 for (var x in cmd.args)
                 {
                     if (this.user.majorGroupAddMemberName(group, cmd.args[x]))
                     {
                         this.com.broadcast(this.user.name(src) + " added " + this.user.nameToProper(cmd.args[x]) + " to the " + group + " group!");
                     }
                 }
             }

             if (cmd.flags.drop)
             {
                 for (var x in cmd.args)
                 {
                     if (this.user.majorGroupDropMemeberName(group, cmd.args[x]))
                     {
                         this.com.broadcast(this.user.name(src) + " removed " + this.user.nameToProper(cmd.args[x]) + " from the " + group + " group!");
                     }
                 }
             }



         }
     }

 });