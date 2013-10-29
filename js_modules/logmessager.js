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
     require: ["logs", "com", "theme", "commands", "io", "user", "theme"],

     loadModule: function ()
     {


         this.io.registerConfig(this, { useLoggingChannel: true, loggingChannel: "Watch"});
         this.user.registerConfigHook(this, "configuration");

         this.logs.registerLogHandler(this, "logMessage");

         this.script.registerHandler("afterLogIn", this);
     },


     configuration: function (c)
     {
         if (!c.recieveLogTypes) c.recieveLogTypes = ["script", "io", "scripterror", "user", "command", "security"];
         if (!("logsChannel" in c)) c.logsChannel = "Watch";
     },

     afterLogIn: function (src)
     {
         var cfg;
         if (this.user.hasPerm(src, "LOGS") && (cfg = this.user.userConfig(src)).logsChannel)
         {
             sys.putInChannel(src, sys.channelId(cfg.logsChannel));

         }
     },


     logMessage: function(log)
     {
         var level = log.level, msg = log.msg, players = sys.playerIds().concat([0]);

	 try
         {
             l0: for (var x in players)
             {

                 if (this.user.hasPerm(players[x], "LOGS"))
                 {
                     var cfg = this.user.userConfig(players[x]),
                     lt = cfg.recieveLogTypes,
                     c = (cfg.logsChannel == "" ? -1 : (sys.channelId(cfg.logsChannel)|0));
                     if (c != -1 && players[x] != 0 &&sys.channelsOfPlayer(players[x]).indexOf(c) == -1) continue l0;

                     // Check if the user wants to recieve this tpe of log
                     if (lt.indexOf("*") !== -1 || lt.indexOf(level) !== -1)
                     {
                         //Check if the user has permission to view this type of log message.
                         if (this.user.hasPerm(players[x], "LOGS[" + level.toUpperCase()+"]"))
                         {
                             this.com.message(players[x], log.msg, this.theme.LOG, false, [(c == -1? undefined : c)]);
                         }
                     }

                 }
             }
         } catch(e)
         {
             print(e + "\n\n" + e.backtracetext);//  this.script.error(e);
         }
     }
 });