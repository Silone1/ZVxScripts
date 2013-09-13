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
     require: ["commands", "io", "com", "theme"],


     loadModule: function ()
     {
         this.commands.registerCommand("configure", this);
     },

     configure:
     {
         server: true,

         code: function (src, cmd, chan, cache)
         {
             try
             {
                 var groups = cache || this.user.groups(src);
                 if (this.parseConfigureString(src, cmd.input, groups) != 2) this.com.message(src, "Configured.", this.theme.INFO);
                 return;
             }
             catch (e)
             {
                 this.com.message(src, "Configure error in " + cmd.input + ": " + e, this.theme.WARN);



                 return;
             }
         },

         perm: function (src)
         {
             var g =  this.user.groups(src);
             if ("SERVEROP" in g || "CONFIGURE" in g)
             {
                 return g;
             }

             return false;

         }


     },

     parseConfigureString: function (src, string)
     {
         var match = string.match(/^\s*([\w]+(?:\.[\w]+)*)(?:\s*(\=|\+\=|<<|>>|~)\s*(.*$))?/i);

         var pathway = match[1].split(/\./g);

         //if (this.user.isSuper(src)
         //implement permission checks later

         this.user.groups(src)

         if (pathway.length <= 1) throw new Error("Inconfigurable property");



         var finalProp = pathway.pop();

         if (finalProp === "__proto__") throw new Error("Smartass eh?");

         var modobj = this.io.configs;
         // var schemaobj = this.io.schemas[module];
         // var schema;

         for (var x in pathway)
         {

             var i = pathway[x];

             if (i === "__proto__") throw new Error("Smartass eh?");

             modobj = modobj[pathway[x]];

             if (typeof modobj !== "object" || modobj instanceof Array) throw new Error("Invalid property chain");

         }

         if (! match[2])
         {
             this.com.message(src, JSON.stringify(modobj[finalProp]), this.theme.INFO);
             return 2;
         }

         var prop = JSON.parse(match[3]);



         switch (match[2])
         {
         case ":=":
         case "=":
             if (typeof prop != "object" && typeof prop === typeof modobj[finalProp])
             {
                 modobj[finalProp] = prop;
                 return true;
             }
             else if (typeof modobj[finalProp] === "object" && modobj[finalProp] instanceof Array && typeof prop === "object" && prop instanceof Array)
             {
                 for (x in prop) if (typeof prop[x] === "object") throw new Error("Wrong argument type or wrong operator.");

                 modobj[finalProp] = prop;
                 return true;
             }
             throw new Error("Wrong argument type or wrong operator.");
         case "<<":
             if (typeof modobj[finalProp] === "object" && modobj[finalProp] instanceof Array && typeof prop != "object")
             {
                 modobj[finalProp].push(prop);
                 return true;
             }
             throw new Error("Wrong argument type or wrong operator.");
         case ">>":
             if (typeof modobj[finalProp] === "object" && modobj[finalProp] instanceof Array && typeof prop != "object")
             {
                 if (modobj[finalProp].indexOf(prop) !== -1) modobj[finalProp].splice(modobj[finalProp].indexOf(prop), 1);
                 return true;
             }
             throw new Error("Wrong argument type or wrong operator.");
         case "~":




         }

         throw new Error("Wrong argument type or wrong operator.");


     },

     listConfigureProperties: function ()
     {

     }



 });