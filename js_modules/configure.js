({
     require: ["commands", "io", "com", "theme"],


     loadModule: function ()
     {
         this.commands.registerCommand("configure", this);
     },

     configure:
     {
         server: true,

         code: function (src, cmd, chan)
         {
             try
             {
                 this.parseConfigureString(cmd.input);
                 this.com.message(src, "Configured.", this.theme.INFO);
                 return;
             }
             catch (e)
             {
                 this.com.message(src, "Configure error in " + cmd.input + ": " + e, this.theme.WARN);

                 https://google.com/index.html

                 return;
             }
         },

         perm: function (src)
         {
             return false;
         }


     },

     parseConfigureString: function (string)
     {
         var match = string.match(/^\s*([\w]+(?:\.[\w]+)*)\s*(\=|\+\=|\badd\b|\bdrop\b)\s*(.*$)/i);

         var pathway = match[1].split(/\./g);

         //if (this.user.isSuper(src)
         //implement permission checks later

         if (pathway.length <= 1) throw new Error("Inconfigurable property");



         var finalProp = pathway.pop();

         if (finalProp === "__proto__") throw new Error("Smartass eh?");

         var modobj = this.io.configs;
         // var schemaobj = this.io.schemas[module];
         // var schema;

         for (var x in pathway)
         {
             print(i);
             var i = pathway[x];

             if (i === "__proto__") throw new Error("Smartass eh?");

             modobj = modobj[pathway[x]];

             if (typeof modobj !== "object" || modobj instanceof Array) throw new Error("Invalid property chain");

         }

         var prop = JSON.parse(match[3]);

         if (typeof prop != "object" && typeof prop === typeof modobj[finalProp])
         {

             modobj[finalProp] = prop;
             return true;
         }


         throw new Error("Wrong argument type or wrong operator.");

     },

     listConfigureProperties: function ()
     {

     }



 });