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
/** Commands list
 * @name cmdlist_command
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.cmdlist_command */
({
    require: ["commands", "com","text", "theme", "less"]
    ,
    /** Lists all commands available to the user
     * @type commandDescriptor
     * */
    commandlist:
    {
        server: true
        ,
        aliases: ["commands", "cmdlist"]
        ,
        desc: "Lists the commands available to the user."
        ,
        options:
        {
            "all": "Also list commands the user doesn't have permission to use",
            "nodesc": "Do not show the long description of the commands"
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

            if (src != 0 && !cmd.flags.nodesc) msg.push("<table border=1><tr><td><b>Command Name</b>"+(cmd.flags.all?"<td><b>Permission</b></td>":"")+"</td><td><b>Description</b></td><td><b>Options</b></td>");

            if (!cmd.flags.nodesc) for (var x in cmds)
            {

                if (cmds[x].name != x) continue;

                var canuse = this.commands.commandPerm(src, {name:cmds[x].name}, chan);

                if (!cmd.flags.all && !canuse) continue;

                if (!cmd.flags.nodesc)
                {

                    msg.push("<b>/" + text.escapeHTML(x) +"</b>" + (canuse?"":" (NO PERMISSION)") + (cmds[x].desc?" "+cmds[x].desc:"") );

                    if (cmds[x].options)
                    {
                        var options = cmds[x].options;

                        for (var x2 in options)
                        {
                            msg.push("&nbsp;&nbsp;&nbsp;&nbsp;--" + text.escapeHTML(x2) + "&nbsp;&nbsp;&nbsp;&nbsp;" + text.escapeHTML(options[x2]));
                        }
                    }
                }

                else msg.push(x);
            }

            if (!cmd.flags.nodesc)
            {
                this.com.message([src], "Commands list:", this.theme.INFO, true);
                this.less.less(src, msg.join("<br />"), true);
            }
            else this.com.message(src, "Commands list:\n" + msg.join(", ") + ".\nFor more information about a command, type /help <command name>.");

        }
    }
    ,
    loadModule: function ()
    {
        this.commands.registerCommand("commandlist", this);
    }
});
