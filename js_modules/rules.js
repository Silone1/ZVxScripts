({ // starts module
    require: ["commands", "com", "io"],
    loadModule: // rules.loadModule
    function ()
    {
        this.commands.registerCommand("rules", this);

        this.io.registerConfig(this, { rules: ["No trolling.", "No flaming.", "No spamming."], sendRulesOnLogin: 0 });

        this.script.registerHandler("afterLogIn", this);
    },


    rules:
    {
        perm: function ()
        {
            return true; // all users shoudl be able to use /rules so don't check anything
        },

        code: function (src, cmd, chan) // code that runs /rules
        {
             var x; // declare variable x

             for (x in this.config.rules)
             {
                 this.com.message(src, "Rule #" + x + ": " + this.config.rules[x]);
             }
        }

    },

    afterLogIn: function (src)
    {
        if (this.config.sendRulesOnLogin == 1)
        {
            this.com.message(src, "Please type /rules to read the rules!");
        }

        if (this.config.sendRulesOnLogin == 2)
        {
            var x; // declare variable x

            for (x in this.config.rules)
            {
                this.com.message(src, "Rule #" + x + ": " + this.config.rules[x]);
            }
        }
    }
});
