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
    require: ["commands", "logs", "text"]
    ,
    loadModule: function ()
    {
        //this.publicIP = sys.synchronousWebCall("http://icanhazip.com/");

        /* if (!this.publicIP || !this.publicIP.match(/^(\d{1,3}\.){3}\d{1,3}\n?$/))
        {
            //this.publicIP = null; //throw new Error("Could not initialize public IP")
            this.logs.logMessage(this.logs.CRITICAL, "Could not initialize public IP");
            return;
        }*/

        this.commands.registerCommand("getsource", this);
    }
    ,
    getsource:
    {
        perm: function ()
        {
            return true;
        }
        ,
        options:
        {
            client: "Sends the source into the client window, instead of a link if available."
        }
        ,
        code: function (src, cmd, chan)
        {
            this.sendSource(src, cmd.flags.client);
        }
    }
    ,
    sendSource: function (src)
    {
        var test = null;

        // test = sys.synchronousWebCall("http://localhost:5081/test");

        var text = [];
        if (1)// || test !== "ZScripts Web Module: Confirming source distributed via webserver. /s/ zscriptswebsource");
        {
            var flist = sys.filesForDirectory("js_modules");
            for (var x in flist) if (!flist[x].match(/^#.+#$/) && !flist[x].match(/~$/))
            {
                text.push("<b>File: " + flist[x] + "</b>");
                text.push("<code>" + this.text.escapeHTML(sys.read("js_modules/" + flist[x] )) + "</code>");
            }
            sys.sendHtmlMessage(src, "<hr/>" + text.join("<hr/>")+ "<hr/>");
        }

        if (0 && test)
        {
         //   sys.sendHtmlMessage(src, "<a href='http://" + this.ip + ":5081/zscripts-source.zip'>Download</a>");
        }


    }
});