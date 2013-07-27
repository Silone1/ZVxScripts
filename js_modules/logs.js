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
    require: ["com", "theme", "text", "util"],


    hotswap: function (old)
    {
        this.savedLogFunction = old.savedLogFunction;
        this.script.log = this.util.bind(
            this
            ,
            function(msg)
            {
                this.logMessage(this.SCRIPT, msg);
            }
        );
        this.logs = old.logs;

        this.registerLogHandler = this.util.generateRegistor(this, this.util.UNARY_REGISTOR, "logHandlers", false);

        return true;
    },

    logs: [],


    DEBUG: "debug",
    USER: "user",
    COMMAND: "command",
    SCRIPT: "script",
    WARN: "security",
    ERROR: "scripterror",
    CRITICAL: "scripterror",
    SCRIPTERROR: "scripterror",
    INFO: "info",
    CHAT: "chat",
    IO: "io",




    logMessage: function (level, msg)
    {
        var log = {level: level, msg:msg, time: (new Date).toString(), trace: sys.backtrace()};

        try
        {
            sys.append("logs.txt", JSON.stringify(log) + "\n");
        } catch (_) {}

        this.logs.push(log);

        for (var x in this.logHandlers)
        {
            this.logHandlers[x].apply(this.logHandlers[x].module, [log]);
        }
    },


    loadModule: function ()
    {
        this.savedLogFunction = this.script.log;
        this.script.log = this.util.bind(
            this
            ,
            function(msg)
            {
                this.logMessage(this.SCRIPT, msg);
            }
        );

        this.registerLogHandler = this.util.generateRegistor(this, this.util.UNARY_REGISTOR, "logHandlers", false);
    },


    unloadModule: function ()
    {
        this.script.log = this.savedLogFunction;
    }
});
