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
    require: ["commands", "text", "security", "com", "user", "io"]
    ,
    loadModule: function ()
    {
        this.commands.registerCommand("me", this);
        this.io.registerConfig(this, { fmt: "<font color=blue><timestamp /><i><username/> <message/></i></font>" });
    }
    ,
    "me":
    {
        server: true,
        category: "fun",
        
        desc: "Says something"
        ,
        perm: function(src)
        {
            return this.user.hasPerm(src, "CHAT");
        }
        ,
        code: function(src, cmd, chan)
        {
            this.com.broadcast(this.config.fmt.replace(/<username\s*\/?>/g, this.text.escapeHTML(this.user.name(src))).replace(/<message\s*\/?>/g, this.text.escapeHTML(cmd.input || "")) , -1, true, (chan == -1?void 0:chan));
        }
    }
});
