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
/** handles ~~Server~~: /bla bla
 * @name server
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.server */
({
    require: ["commands", "parsecommand", "com", "theme", "logs", "user", "chat"]
    ,
    serverChan: null
    ,
    SERVER: 0
    ,
    loadModule: function ()
    {
        this.script.registerHandler("beforeServerMessage", this);
        this.commands.registerCommand("srvchan", this);
        this.serverChan = -1;
    }
    ,
    /** This event catches commands and executes them.
     * @event
     */
    beforeServerMessage: function (msg)
    {
        sys.stopEvent();

        this.chat.beforeChatMessage(this.SERVER, msg, this.serverChan);

        /*
        if (msg.match(/^\//))
        {
	    this.commands.issueCommand( this.SERVER, msg, this.serverChan);

            return;

            var cmdObj = this.parsecommand.parseCommand(msg);
            var cmdName = cmdObj.name;

            this.logs.logMessage(this.logs.COMMAND, (this.serverChan ? "[#"+sys.channel(this.serverChannel)+"] " : "") + this.user.name(this.SERVER) + ": " + msg);

            if (!cmdName)
            {
                this.com.message(this.SERVER, "Please enter a command.", this.theme.WARN);
                return;
            }

            if (!this.commands.commands_db[cmdName])
            {
                this.com.message(this.SERVER, "Command does not exist.", this.theme.WARN);
                return;
            }

            if (!this.commands.serverCanUseCmd(cmdName))
            {
                this.com.message(this.SERVER, "Sorry, but that command can't be used in the server console.", this.theme.WARN);
                return;
            }

            var cd = this.commands.commands_db[cmdName];

            cd.code.call(cd.bind, 0, cmdObj, this.serverChan);
        }

        else
        {
            sys.broadcast(msg, this.serverChan, this.SERVER, false, -1);
            this.logs.logMessage(this.logs.CHAT, (this.serverChan === -1 ? "[N/A] " : "[#"+sys.channel(this.serverChan)+"] ") + this.user.name(this.SERVER) + ": " + msg);
        }
         */
    }
    ,
    srvchan:
    {
        category: "administrative",
        server:true,
        desc: "Sets the channel used by the server messages.",
        perm: function(src) { return false; },
        code: function (src, cmd, chan)
        {
            if (!cmd.input)
            {
                this.serverChan = -1;
                this.logs.logMessage(this.logs.INFO, this.user.name(src) + " unset the server channel.", this.theme.INFO);
                return;
            }

            var c = cmd.input;

            var ch = sys.channelId(c);

            if (ch == undefined)
            {
                this.com.message(src, "Unknown channel.", this.theme.WARN);
                return;
            }

            this.logs.logMessage(this.logs.INFO, this.user.name(src) + " set the server channel to #" + sys.channel(ch) + ".", this.theme.INFO);
            this.serverChan = ch;

            return;
        }
    }
});