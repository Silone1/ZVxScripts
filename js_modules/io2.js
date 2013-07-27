
// WIP replacement for io.js, more advanced

({

     dbs: null,

     registerDB: function (module, dbname, options)
     {
         if (this.dbs[dbname]) return;

         var db = this.dbs[dbname] = new Object;

         var meta;
       
         if (sys.exists("js_databases/" + dbname + ".meta.json")) meta = JSON.parse(sys.read("js_databases/" + dbname + ".meta.json"));

         else meta = new Object;

         options.hotswappable = !!options.hotswappable;

         options.journal = !!options.journal;

     },

     loadModule: function ()
     {
         this.dbs = new Object;
     }
})