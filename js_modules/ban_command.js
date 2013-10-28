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
/** Module that holds /ban, /banlist, /unban, etc.
 * @name ban_command
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.ban_command */
({
     require: ["commands", "security", "text", "com", "theme", "time", "user", "util"],

     /** The unban command descriptor
      * @type commandDescriptor
      * */
     unbanall:
     {
         server: true,
         category: "security/ban",
         desc: "Clears the ban list",
         perm: "BAN",
         code: function (src, cmd)
         {
             if (!(cmd.flags.force))
             {
                 this.com.message([src], "Are you sure you want to do this? Retry with --force option.", this.theme.WARN);
                 return;
             }

             this.com.broadcast(this.user.name(src) + " has cleared the server's ban list.");

             this.security.database.bans = new Object;
         }
     },

     unban:
     {
         server: true,
         category: "security/ban",
         desc: "Removes bans from users",
         perm: function (src)
         {
             return this.user.hasPerm(src, "BAN");
         },
         code: function (src, cmd, chan)
         {

             var removes = [];

             for (var x in cmd.args)
             {
                 removes = removes.concat(this.security.removeAfflicted(cmd.args[x], this.security.database.bans));
             }

             removes = this.util.concatSets(removes);

             this.com.broadcast(this.user.name(src) + " has removed ban(s) #" + removes.join(", #") + "!");

         }
     },

     ban:
     {
         server: true,
         category: "security/ban",
         desc:  "Ban prevents users from joining the server. Can ban usernames, IPs, regular expressions, or subnets. Users with PROTECTED permission are not affecte by bans.",
         options:
         {
             reason: "Specifies a reason for the ban",
             time: "Duration of ban"
         },
         perm: function (src)
         {
             return this.user.hasPerm(src, "BAN");
         },
         code: function (src, cmd, chan)
         {

             var ips = [];
             var subnets = [];
             var names = [];
             var regexes = [];
             var hostnames = [];


             for (var x in cmd.args)
             {
                 if (cmd.args[x].match(/^\d+\.\d+\.\d+\.\d+$/))
                 {
                     ips.push(cmd.args[x]);
                 }

                 else if (cmd.args[x].match(/^\d+\.\d+\.\d+\.\d+\/\d+$/))
                 {
                     subnets.push(cmd.args[x]);
                 }

                 else if (cmd.args[x].match(/^\/.+\/\w*$/))
                 {
                     regexes.push(cmd.args[x]);
                 }

                 else if (cmd.args[x].match(/^hostname\/.+\/\w*$/))
                 {
                     hostnames.push(cmd.args[x].replace(/^hostname\/(.+)\/(\w+)$/, function (m, a, b) { return "/" + a + "/" +b; }));
                 }

                 else
                 {
                     names.push(cmd.args[x]);
                 }


             }

             if (cmd.flags.ip) for (var x in names)
             {

                 ips = this.util.concatSets(ips, [sys.dbIp(names[x])]);

             }


             var exp = false;
             var t = null;

             if (cmd.flags.time)
             {
                 t = this.time.strToDiff(cmd.flags.time);

                 if (t) exp = t + +new Date;

             }

             var o =  {
                 ips: ips,
                 subnets: subnets,
                 names: names,
                 nameRegex: regexes,
                 hostnames: hostnames,
                 expires: exp,
                 reason: cmd.flags.reason || null,
                 author: this.user.name(src)
             };

             this.com.broadcast(
                 "<hr/>" +
                     this.text.escapeHTML(
                         this.user.name(src) + " issued ban #" +this.security.database.banCtr
                     ) +
                     "<br/>" + this.theme.issuehtml(o) +
                     "<hr/>"
                 ,
                 this.theme.CRITICAL,
                 true
             );




             this.security.database.bans[this.security.database.banCtr++] = o;

             this.security.chk();


         }
     },

     banlist:
     {
         server: true,
         category: "security/ban",
         desc: "Lists banned users",
         perm: function (src)
         {
             return this.user.hasPerm(src, "LIST[BANS]");
         },
         code: function (src)
         {

             var mutes = [];
             var mutelist = this.security.database.bans;

             for (var x in mutelist)
             {
                 mutes.push (
                     "<b>Ban #" + x + ":</b><br/>" + this.theme.issuehtml(mutelist[x])
                 );
             }

             this.com.message([src], "Ban list:<br/>" + mutes.join("<br/><br/>"), this.theme.INFO, true);
         }

     },

     loadModule: function()
     {
         this.commands.registerCommand("ban", this);
         this.commands.registerCommand("unban", this);
         this.commands.registerCommand("banlist", this);
         this.commands.registerCommand("unbanall", this);
     }
 });
