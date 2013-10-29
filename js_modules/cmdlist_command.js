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
/** Commands list
 * @name cmdlist_command
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.cmdlist_command */
({
    require: ["commands", "com","text", "theme", "less", "user", "parsecommand"]
    ,
    /** Lists all commands available to the user
     * @type commandDescriptor
     * */
    commandlist:
    {
        server: true,
        category: "basic",
        aliases: ["commands", "cmdlist"]
        ,
        desc: "Lists the commands available to the user."
        ,

        examples:
        [
            [{args:[], flags:{all:true}}, "Shows all of the commands."],
            [{args:[], flags:{nodesc:true}}, "Be brief."],
            [{args:[], flags:{noexamples:true}}, "Don't show the examples."]

        ],
        options:
        {
            "all": "Also list commands the user doesn't have permission to use",
            "nodesc": "Do not show the long description of the commands",
            "noexamples": "Don't show examples"
        }
        ,
        perm: function ()
        {
            return true;
        }
        ,
        code: function (src, cmd, chan)
        {
            var cmds = this.commands.commands_db;
            var com = this.com;
            var text = this.text;
            var msg = [];
            var sys_auth$src = sys.auth(src);



            var cmdtab = Object.keys(cmds);

            function cmpstr (a,b)
            {
                if (a === b) return 0;
                if ([a,b].sort()[0] === a) return -1;
                return 1;
            }

            function catsort(a, b)
            {
                return cmpstr(cmds[a].category, cmds[b].category);
            }

            print(cmdtab);
            cmdtab.sort(catsort);
            print(cmdtab);

            var lastcat = null;

            if (!cmd.flags.nodesc) for (var i in cmdtab)
            {
                var x = cmdtab[i];
                if (cmds[x].name != x) continue;



                var canuse = this.commands.commandPerm(src, {name:cmds[x].name}, chan);

                if (!cmd.flags.all && !canuse) continue;

                if (!cmd.flags.nodesc)
                {
                    if (lastcat !== (lastcat = cmds[x].category))
                    {
                        msg.push("<font color=blue><b>"+lastcat[0].toUpperCase() + lastcat.substr(1) + "</b></font>");

                    }

                    msg.push("<b>/" + text.escapeHTML(x) +"</b>" + (canuse?"":" [NO PERMISSION]") + this.text.escapeHTML(cmds[x].desc?" "+cmds[x].desc:"") );

                    if (cmds[x].options)
                    {
                        msg.push("<em>Options:</em>");
                        var options = cmds[x].options;

                        for (var x2 in options)
                        {
                            msg.push("&nbsp;&nbsp;&nbsp;&nbsp;<em>" + text.escapeHTML(x2) + "</em>&nbsp;&nbsp;&nbsp;&nbsp;" + text.escapeHTML(options[x2]));
                        }
                    }

                    if (!cmd.flags.noexamples && cmds[x].examples)
                    {
                        msg.push("<em>Examples:</em>");

                        function estring(ex)
                        {
                            if (typeof ex == "string") return ex;

                            return this.parsecommand.commandUnParsers[this.user.userConfig(src).commandParser](ex);

                        }

                        for (x2 in cmds[x].examples) msg.push(this.text.escapeHTML("    /" + cmds[x].name + " " + estring.call(this, cmds[x].examples[x2][0]) +"\n        " + cmds[x].examples[x2][1]));
                    }
                }

                else msg.push(x);
            }

            if (!cmd.flags.nodesc)
            {
                this.com.message([src], "Commands list:", this.theme.INFO, true);
                this.less.less(src, msg.join("<br />"), true);
            }
            else this.com.message(src, "Commands list:\n" + Object.keys(cmds).join(", ") + ".\nFor more information about a command, type /help <command name>.");

        }
    }
    ,
    loadModule: function ()
    {
        this.commands.registerCommand("commandlist", this);
    }
});
