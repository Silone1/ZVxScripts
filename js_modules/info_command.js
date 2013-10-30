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
     require: ["com", "text", "commands", "theme", "logs", "user"],

     info:
     {
         server: true,
         category: "security",
         options:
         {
             group: "Take info about groups instead of users."
         },
         desc: "Shows information about users/groups",
         perm: "INFO",
         code: function (src, cmd)
         {
             var names = cmd.args, x, m = [];


             var se_group_perm = this.user.hasPerm(src, "INFO[PERMS]");
             var mj_group_perm = this.user.hasPerm(src, "INFO[GROUPS]");
             var auth_perm = this.user.hasPerm(src, "INFO[AUTH]");
             var ip_perm = this.user.hasPerm(src, "INFO[IP]");

             if (cmd.flags.group)
             {
                 if (!mj_group_perm)
                 {
                     return { status: this.commands.PERMISSION_ERROR, perm: "INFO[GROUPS]"};
                 }

                 if (Object.keys(names).length === 0)
                 {
                     names = Object.keys(this.user.database.majorgroupinfo);
                 }
                 for (x in names)
                 {
                     var g = this.user.getGroup(names[x]);

                     m.push("<b>Info about group: </b>" + names[x]);

                     if (!g) {m.push("<i>Does not exist.</i>"); continue;}


                     if (! (g.name in {"User": null, "Registered": null} )) m.push("Members: " + g.members.join(", "));
                     if (se_group_perm)
                     {
                         m.push("Permissions: </b>" + g.perms.join(", "));
                         m.push("Inherits: </b>" + g.inherits.join(", "));
                     }

                 }
             }
             else
             {


                 for (x in names)
                 {
                     m.push("<b>Info about user: " + names[x] +"</b>");
                     if (auth_perm) m.push("Auth level: " + this.user.nameAuth(names[x]));
                     if (ip_perm) m.push("IP Address: " + sys.dbIp(names[x]));
                     if (mj_group_perm) m.push("Major Groups: " + Object.keys(this.user.nameMajorGroups(names[x])).join (", ") + ".");
                     if (se_group_perm) m.push("Permissions: " + Object.keys(this.user.nameGroups(names[x])));
                 }


             }

             this.com.message([src], "<br/>"+m.join("<br/>"), this.theme.INFO, true);
         }
     },

     loadModule: function()
     {
         this.commands.registerCommand("info", this);
     }
 });
