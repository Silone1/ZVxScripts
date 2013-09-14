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
/** Implements I/O layer, version 2
 * @name io2
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.io2 */
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

         module.onUnloadModule(
             this.util.bind(
                 this,
                 function ()
                 {
                     this.semaphoreReduce(dbname);
                 }
             )
         );
         
     },


     semaphoreReduce: function (dbname)
     {
         if (! this.dbs[dbname]) throw new Error("Database is not stated.");

         this.dbs[dbname].semaphore--;

         if (this.dbs[dbname].semaphore === 0)
         {
             this.closeDB(dbname);
             return;
         }         
         
     },


     openDB: function (dbname)
     {
         if (! this.dbs[dbname]) throw new Error("Database not statted.");
         
         var db, dbj, bck;

         if (sys.exists("js_databases/" + dbname + ".jsdb")) db = sys.read("js_databases/" + dbname + ".jsdb");
         if (sys.exists("js_databases/#" + dbname + ".jsdb#")) bck = sys.read("js_databases/" + dbname + ".jsdb");
         if (sys.exists("js_databases/" + dbname + ".jsdb.journal")) dbj = sys.read("js_databases/" + dbname + ".jsdb");

         var db.text = "";

         var journal = dbj.match(/[^\a\n]*\a[^\a\n]*\n/g);

         var start = +new Date;

         this.print("Reading journal entries for " + dbname);

         journal.forEach( 
             function (elm, idx)
             {
                 var splitter = elm.match(/(^[\a\n]*)\a([^\a\n]*)\n$/);

                 if (!splitter) throw new Error("E.E")
             }
         );
     },


     semaphoreIncrease: function (dbname)
     {
         if (! this.dbs[dbname]) throw new Error("Database is not loaded.");

         this.dbs[dbname].semaphore++;         
     },

     loadModule: function ()
     {
         this.dbs = new Object;
     }
})