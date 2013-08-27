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
            return false;
        },

        code: function (src, cmd, chan)
        {
            this.script.beforeServerMessage(cmd.input);
        }
    }

});