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
    require: ["commands", "security",  "text", "com", "theme", "time", "user", "util"]
    ,
    unmuteall:
    {
        server:true,
        desc: "Clear the mute list"
        ,
        perm:"MUTE",

        code: function (src, cmd)
        {
            if (!(cmd.flags.force))
            {
                this.com.message([src], "Are you sure you want to do this? Retry with --force option.", this.theme.WARN);
                return;
            }

            this.com.broadcast(this.user.name(src) + " has cleared the server's mute list.");

            this.security.database.mutes = new Object;
        }
    }
    ,
    unmute:
    {
        server: true
        ,
        desc: "Remove mute(s) from user(s)"
        ,
        perm: "MUTE",

        code: function (src, cmd, chan)
        {
            var removes = [];

            for (var x in cmd.args)
            {
                removes = removes.concat(this.security.removeAfflicted(cmd.args[x], this.security.database.mutes));
            }

            removes = this.util.concatSets(removes);

            this.com.broadcast(this.user.name(src) + " has removed mute(s) #" + removes.join(", #") + "!");
        }
    }
    ,
    mute:
    {
        server:true,

        desc: "Mute prevents users from talking in the main chat. Can mute usernames, IPs, regular expressions, or subnets. Users with PROTECTED permission are not affecte by mutes.",

        options:
        {
            reason: "Reason for the mute",
            time: "Duration to mute for",
            ip: "Also mute the user's IP address."
        },

        examples:
        [
            [{args:["spammer", "spammer2"], flags:{reason:"spamming", time:"1 hour, 30 minutes, 20 seconds"}}, "Mutes the players spammer and spammer2 for a while. Also puts in a log as to why they were muted."]
        ],

        perm: "MUTE",


        code: function (src, cmd, chan)
        {
            var b = new Object;

            var ips = [];
            var subnets = [];
            var names = [];
            var regexes = [];
            var hostnames = [];


            for (var x in cmd.args)
            {
                if (cmd.args[x].match(/^\d+\.\d+\.\d+\.\d+$/))
                {
                    ips.push(cmd.args[x]);
                }

                else if (cmd.args[x].match(/^\d+\.\d+\.\d+\.\d+\/\d+$/))
                {
                    subnets.push(cmd.args[x]);
                }

                else if (cmd.args[x].match(/^\/.+\/\w+$/))
                {
                    regexes.push(cmd.args[x]);
                }

                else if (cmd.args[x].match(/^hostname\/.+\/\w+$/))
                {
                    hostnames.push(cmd.args[x].replace(/^hostname\/(.+)\/(\w+)$/, function (m, a, b) { return "/" + a + "/" +b; }));
                }

                else
                {
                    names.push(cmd.args[x]);
                }


            }

            if (cmd.flags.ip) for (var x in names)
            {
                ips = this.util.concatSets(ips, [sys.dbIp(names[x])]);
            }


            var exp = false;
            var t = null;


            if (cmd.flags.time)
            {
                t = this.time.strToDiff(cmd.flags.time);

                if (t) exp = t + +new Date;

            }

            var o =  {
                ips: ips,
                subnets: subnets,
                names: names,
                nameRegex: regexes,
                hostnames: hostnames,
                expires: exp,
                reason: cmd.flags.reason,
                author: this.user.name(src)
            };

            this.com.broadcast(
                "<hr/>" +
                    this.text.escapeHTML(
                        this.user.name(src) + " issued mute #" +this.security.database.muteCtr
                    ) +
                    "<br/>" + this.theme.issuehtml(o) +
                    "<hr/>"
                ,
                this.theme.CRITICAL,
                true
            );




            this.security.database.mutes[this.security.database.muteCtr++] = o;

        }
    }
    ,
    mutelist:
    {
        server:true,

        perm: "LIST[MUTES]"
        ,
        code: function (src)
        {
            var mutes = [];

            var mutelist = this.security.database.mutes;

            for (var x in mutelist)
            {
                mutes.push (
                    "<b>Mute #" + x + ":</b><br/>" + this.theme.issuehtml(mutelist[x])
                );
            }

            this.com.message([src], "Mute list:<br/>" + mutes.join("<br/><br/>"), this.theme.INFO, true);
        }

    }
    ,
    loadModule: function()
    {
        this.commands.registerCommand("mute", this);
        this.commands.registerCommand("unmute", this);
        this.commands.registerCommand("mutelist", this);
        this.commands.registerCommand("unmuteall", this);
    }
});
