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
     require: ["logs", "com", "theme", "commands", "io"],

     loadModule: function ()
     {
         this.logs.registerLogHandler(this, "logMessage");

         this.io.registerConfig();
     },

     logMessage: function(log)
     {
         var level = log.level;

         var msg = log.msg;

         if (level != this.logs.DEBUG && level != this.logs.CHAT) print("Logs level " + level + ": " +msg);

         if (level == this.logs.CHAT)
         {
            // ignore
         }
         else if (level == this.logs.SCRIPTERROR)
         {
             var auths = [];
             sys.playerIds().forEach(function(i) { if (sys.auth(i) >= 1) auths.push(i); });

             this.com.message(auths, msg, this.theme.CRITICAL);
         }
         else if (level == this.logs.WARN)
         {
             var auths = [];
             sys.playerIds().forEach(function(i) { if (sys.auth(i) >= 1) auths.push(i); });

             this.com.message(auths, msg, this.theme.LOG);
         }
         else if (level == this.logs.USER || level == this.logs.COMMAND || level == this.logs.INFO || level == this.logs.SCRIPT || level == this.logs.IO)
         {
             var auths = [];
             sys.playerIds().forEach(function(i) { if (sys.auth(i) == 3) auths.push(i); });

             this.com.message(auths, msg, this.theme.LOG);
         }

     }
});