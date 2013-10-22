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
     require: ["com", "theme", "chat", "util", "commands", "text", "parsecommand", "user"],

     loadModule: function ()
     {
         this.commands.registerCommand("help", this);
         this.topics = new Object;
     },

     topics: null,

     help:
     {
         category: "basic",
         desc: "Type /help <command name> for help with a command, or /help <topic> for other things(e.g. /help source).",

         examples:
         [
             ["source","Shows source code information"],
             ["setauth", "Shows help for /setauth"]
         ],


         perm: function (src)
         {
             return true;
         },


         code: function (src, cmd, chan)
         {
             var topic = String(cmd.input).toLowerCase();

             if (cmd.input == "" || !cmd.input)
             {
                 this.com.message(src, "Please enter (/help <topic>), example topics: commands, script, source, administration, <command name>.", this.theme.INFO);
                 return;
             }



             if (topic.match(/scripts?|sources?(?:code)?|licenses?|a?gpl/i))
             {
                 this.com.message(
                     src,

                    "<hr/><b>" + this.text.escapeHTML(
                         [
                             "Scripts Copyright (C) 2013  Ryan P. Nicholl, aka \"ArchZombie\" / \"ArchZombie0x\", <archzombielord@gmail.com>",

                             "This program is free software: you can redistribute it and/or modify",
                             "it under the terms of the GNU Affero General Public License as",
                             "published by the Free Software Foundation, either version 3 of the",
                             "License, or (at your option) any later version.",
                             "",
                             "This program is distributed in the hope that it will be useful,",
                             "but WITHOUT ANY WARRANTY; without even the implied warranty of",
                             "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.",
                             "See the GNU Affero General Public License for more details.",
                             "",
                             "You should have received a copy of the GNU Affero General Public License",
                             "along with this program.  If not, see <http://www.gnu.org/licenses/>."
                         ].join("\n")) + "</b><hr/>" +

                     "Source code may be available at <a href='https://github.com/ArchZombie/zvxscripts'>https://github.com/ArchZombie/zvxscripts</a>, or in the following .ZIP file: " +
                         "<a href='https://github.com/ArchZombie/zvxscripts/archive/master.zip'>https://github.com/ArchZombie/zvxscripts/archive/master.zip</a>.<br/><br/>" +
                         "If the source code is modified but this license notice is not updated, you may be able to get the source using /getsource.<br/>"+
                         "Report license violations to <a href='mailto:archzombielord@gmail.com'>&lt;archzombielord@gmail.com&gt;</a>.<hr/>" +

                         "Using ZScript Framework v" + (this.script.version ? this.script.version : "BETA-1.0.0"),

                     this.theme.INFO, // theme

                     true // html

                 );
             }

             else if (topic in this.commands.commands_db)
             {

                 var canuse = this.commands.commandPerm(src, {name:topic, args: [], flags:{}}, chan);

                 var str = "<b>Command " + this.commands.commands_db[topic].name + ":</b><br/>" +
                     "<b>Permission:</b> " +(canuse?"yes":"<font color=red><b>no</b></font>")+"<br/>"+
                     "<b>Description:</b> " + (this.commands.commands_db[topic].desc?" "+this.commands.commands_db[topic].desc:"n/a")+"<br/>"+
                     "<b>Options:</b> ";

                 if (this.commands.commands_db[topic].options)
                 {
                     var options = this.commands.commands_db[topic].options;

                     for (var x2 in options)
                     {
                         str += ("<br/>&nbsp;&nbsp;&nbsp;&nbsp;<em>" + this.text.escapeHTML(x2) + "</em>&nbsp;&nbsp;&nbsp;&nbsp;" + this.text.escapeHTML(options[x2]));
                     }
                 }
                 else
                 {
                     str += "<i>none</i>";
                 }

                 function estring(ex)
                 {
                     if (typeof ex == "string") return ex;

                     return this.parsecommand.commandUnParsers[this.user.userConfig(src).commandParser](ex);

                 }

                 if (this.commands.commands_db[topic].examples)

                 {
                     str += "<br/><b>Examples:</b>";



                     for (x2 in this.commands.commands_db[topic].examples) str += ("<br/>" + this.text.escapeHTML("    /" + topic + " " + estring.call(this, this.commands.commands_db[topic].examples[x2][0]) +"\n        " + this.commands.commands_db[topic].examples[x2][1]));

                 }

                 this.com.message(src, str, this.theme.INFO, true);
             }

         }
     }


 });
