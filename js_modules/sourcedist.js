({
     require: ["commands", "logs", "text"]
    ,
    loadModule: function ()
    {
        this.publicIP = sys.synchronousWebCall("http://icanhazip.com/");

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
        if (0 && test !== "ZScripts Web Module: Confirming source distributed via webserver. /s/ zscriptswebsource");
        {/*
            for (var x in this.script.modules)
            {
                text.push("<b>File: " + x + ".js</b>");
                text.push("<code>" + this.text.escapeHTML(sys.read("js_modules/" + x + ".js")) + "</code>");
            }
            sys.sendHtmlMessage(src, "<hr/>" + text.join("<hr/>")+ "<hr/>");*/
        }

        if (test)
        {
            sys.sendHtmlMessage(src, "<a href='http://" + this.ip + ":5081/zscripts-source.zip'>Download</a>");
        }


    }
});