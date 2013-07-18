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
    require: ["com", "theme", "logs", "commands", "less", "text"]
    ,
    readlogs:
    {
        options:
        {
            count: "How many entries to read.",
            trace: "Show backtraces if available.",
            types: "Comma separated types of log messages to show"
        },

        perm: function (src)
        {
            return sys.auth(src) >= 3;
        }
        ,
        code: function (src, cmd, chan)
        {
            var count = (+cmd.flags.count) || 35;
            var types = cmd.flags.types;
            if (types) types = types.split(/,/g);
            else types = ["chat", "script", "io", "scripterror", "user", "command", "security"];
            var trace = cmd.flags.trace;

            var msgs = [];

            for (var i = this.logs.logs.length - 1; i >= 0 && count > 0; i--)
            {
                if (types.indexOf(this.logs.logs[i].level) !== -1)
                {

                    msgs.push(
                        "<b>Type " + this.logs.logs[i].level + "</b> at <em>" + (this.logs.logs[i].time||"?") + "</em>: " + this.logs.logs[i].msg +
                            ( !trace || !this.logs.logs[i].trace ? "" : "<br/><code>" + this.text.escapeHTML(this.logs.logs[i].trace) + "</code>")
                    );
                    count--;
                }
            }

            this.less.less(src, "<b>Logs:</b><hr/>" + msgs.join("<br/>") + "<hr/>", true);
        }
    }
    ,
    loadModule: function ()
    {
        this.commands.registerCommand("readlogs", this);
    }
});
