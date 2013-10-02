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
     require: ["io", "user"],

     metatype: "runtime",

     DEFAULTS: ["logs",  "iologger", "interceptor", "gateway", "chat", "reset", "modprobe", "server","cmdlist_command", "kick_command", "mute_command", "info_command", "groupmod", "configure", "ban_command", "setauth_command", "sourcedist", "eval_command", "help_command", "modprobe", "io_commands", "userconf"],

     loadModule: function ()
     {
         var x;

         

         this.io.registerConfig(this, { modules: ["me_command", "info_command", "serverimp", "authlist_command", "readlogs_command", "automute", "logmessager" ] });

         for (x in this.DEFAULTS)
         {

             this.script.loadModule(this.DEFAULTS[x]);
         }

         for (x in this.config.modules)
         {
             this.script.loadModule(this.config.modules[x]);
         }
     }


});
