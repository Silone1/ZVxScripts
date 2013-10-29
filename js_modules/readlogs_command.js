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
    require: ["com", "theme", "logs", "commands", "less", "text", "user"]
    ,
    readlogs:
    {
        server: true,

        category: "administrative",

        options:
        {
            count: "How many entries to read.",
            trace: "Show backtraces if available.",
            types: "Comma separated types of log messages to show",
            match: "Pattern matching"
        },

        perm: function (src)
        {
            return "LOGS" in this.user.groups(src);
        }
        ,
        code: function (src, cmd, chan)
        {
            var g = this.user.groups(src);

            var count = (+cmd.flags.count) || 35;
            var ptypes = cmd.flags.types || cmd.flags.type;
            if (ptypes) ptypes = ptypes.split(/,/g);
            else ptypes = ["chat", "script", "io", "scripterror", "user", "command", "security"];
            var trace = cmd.flags.trace;
            var types = [];

            if (! ("ALLPERMS" in g || "LOGS[*]" in g) ) for (var x in ptypes)
            {
                if (("LOGS[" + ptypes[x].toUpperCase() + "]") in g)
                {
                    types.push(ptypes[x]);
                }

                else if (cmd.flags.type || cmd.flags.types) // only warn if the user specified types manually.
                {
                    this.com.message(src, "Permission Denied: Can't view logs of type " + ptypes[x] + ".", this.theme.WARN);
                }
            }

            else types = ptypes;


            var msgs = [];

            for (var i = this.logs.logs.length - 1; i >= 0 && count > 0; i--)
            {
                if (types.indexOf(this.logs.logs[i].level) !== -1 && (!cmd.flags.match || this.text.escapeHTML(this.logs.logs[i].msg).indexOf(cmd.flags.match) !== -1))
                {

                    msgs.push(
                        "<b>Type " + this.logs.logs[i].level + "</b> at <em>" + (this.logs.logs[i].time||"?") + "</em>: " + this.text.escapeHTML(this.logs.logs[i].msg) +
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
