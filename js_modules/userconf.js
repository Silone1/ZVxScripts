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

     require: ["user", "commands", "com", "theme", "zsrx", "io"],

     loadModule: function ()
     {
         this.commands.registerCommand("userconf", this);
         this.io.registerConfig(this, {"maxUserconfLength": 1000});
     },

     userconf:
     {
         server: true,
         perm: true,

         perm: function () { return true; },

         code: function (src, cmd, chan)
         {
             var string = cmd.input || "";

             var origin = this.user.userConfig(src);

             var modobj = origin;

             var match = string.match(/^\s*([\w]+(?:\.[\w]+)*)(?:\s*(\:?\=|\+\=|<<|>>|~)\s*(.*$))?/i);

             if (!match)
             {
                 this.com.message(src, "Conf:\n" + JSON.stringify(modobj, 1, null));
                 return;
             }

             var pathway = match[1].split(/\./g);

             if (pathway.length == 0) { this.com.message(src, "Invalid property chain.", this.theme.WARN); return; }

             var finalProp = pathway.pop();

             if (finalProp === "__proto__") { this.com.message(src, "Invalid property chain.", this.theme.WARN); return; }



             for (var x in pathway)
             {

                 var i = pathway[x];

                 if (i === "__proto__") { this.com.message(src, "Invalid property chain.", this.theme.WARN); return; }

                 modobj = modobj[pathway[x]];

                 if (typeof modobj !== "object" || modobj instanceof Array)
                 {
                     this.com.message(src, "Invalid property chain.");
                     return;
                 }

             }

             if (! match[2])
             {
                 this.com.message(src, JSON.stringify(modobj[finalProp]), this.theme.INFO);
                 return;
             }

             try
             {
                 var prop = JSON.parse(match[3]);
             }
             catch (e)
             {
                 this.com.message(src, "Parse error: " + e);
                 return;
             }



             switch (match[2])
             {
             case ":=":
             case "=":
                 if (typeof prop != "object" && typeof prop === typeof modobj[finalProp])
                 {
                     modobj[finalProp] = prop;
                     if (this.zsrx.zsrx(modobj).length > this.config.maxUserconfLength)
                     {
                         for (var x in origin) delete origin[x];

                         this.com.message(src, "Configuration Overflow.", this.theme.CRITICAL);
                         return;

                     }
                     else this.com.message(src, "Configured.");

                     return true;
                 }
                 else if (typeof modobj[finalProp] === "object" && modobj[finalProp] instanceof Array && typeof prop === "object" && prop instanceof Array)
                 {
                     for (x in prop) if (typeof prop[x] === "object") throw new Error("Wrong argument type or wrong operator.");

                     modobj[finalProp] = prop;

                     if (this.zsrx.zsrx(modobj).length > this.config.maxUserconfLength)
                     {
                         for (var x in origin) delete origin[x];

                         this.com.message(src, "Configuration Overflow.", this.theme.CRITICAL);
                         return;

                     }
                     else this.com.message(src, "Configured.");
                     return true;
                 }
                 throw new Error("Wrong argument type or wrong operator.");
             case "<<":
                 if (typeof modobj[finalProp] === "object" && modobj[finalProp] instanceof Array && typeof prop != "object")
                 {
                     modobj[finalProp].push(prop);
                     if (this.zsrx.zsrx(modobj).length > this.config.maxUserconfLength)
                     {
                         for (var x in origin) delete origin[x];

                         this.com.message(src, "Configuration Overflow.", this.theme.CRITICAL);
                         return;

                     }
                     else this.com.message(src, "Configured.");
                     return true;

                 }
                 throw new Error("Wrong argument type or wrong operator.");
             case ">>":
                 if (typeof modobj[finalProp] === "object" && modobj[finalProp] instanceof Array && typeof prop != "object")
                 {
                     if (modobj[finalProp].indexOf(prop) !== -1) modobj[finalProp].splice(modobj[finalProp].indexOf(prop), 1);

                     if (this.zsrx.zsrx(modobj).length > this.config.maxUserconfLength)
                     {
                         for (var x in origin) delete origin[x];

                         this.com.message(src, "Configuration Overflow.", this.theme.CRITICAL);
                         return;

                     }
                     else this.com.message(src, "Configured.");
                     return;
                 }
                 throw new Error("Wrong argument type or wrong operator.");
             case "~":




             }

             throw new Error("Wrong argument type or wrong operator.");


         }




     }


 });
