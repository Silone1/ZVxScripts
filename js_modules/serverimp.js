({

    require: ["commands"],


    loadModule: function ()
    {
        this.commands.registerCommand("serversay", this);
    },


    serversay:
    {
        server: false,

        perm: function (src)
        {
            return sys.auth(src) == 3;
        },

        code: function (src, cmd, chan)
        {
            this.script.beforeServerMessage(cmd.input);
        }
    }

});