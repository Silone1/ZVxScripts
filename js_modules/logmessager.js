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
         this.logs.registerLogHandler(this, "logMessage");

         this.io.registerConfig(this, { useLoggingChannel: true, loggingChannel: "Watch"});
         this.user.registerConfigHook(this, "configuration");
     },


     configuration: function (c)
     {
         if (!c.recieveLogTypes) c.recieveLogTypes = ["script", "io", "scripterror", "user", "command", "security"];
     },


     logMessage: function(log)
     {
         var level = log.level;

         var msg = log.msg;

         var players = sys.playerIds().concat[0];


         for (var x in players)
         {
             var g = this.user.groups(players[x]);

             if ("SERVEROP" in g || "LOGS" in g)
             {
                 var cfg = this.user.userConfig(players[x]).recieveLogTypes;

                 // Check if the user wants to recieve this tpe of log
                 if (cfg.indexOf("*") !== -1 || cfg.indexOf(level) !== -1)
                 {
                     //Check if the user has permission to view this type of log message.
                     if ("LOGS[*]" in g || "SERVEROP" in g || ("LOGS[" + level.toUpperCase()+"]") in g)
                     {
                         this.com.message(players[x], log.msg, this.theme.LOG);
                     }
                 }

             }
         }

     }
});