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
/** Implements I/O layer
 * @name io
 * @memberOf script.modules
 * @augments Module
 * @namespace
 * */
/** @scope script.modules.io */
({
     require: ["dmp", "logs", "util", "zsrx", "zjdata"],

     /** When database is opened */
     OPEN: 1,
     /** When database is closed */
     CLOSE: 2,
     /** On database commit */
     COMMIT: 3,
     /** On database sync */
     SYNC: 4,
     /** On databse backup */
     BACKUP: 5,
     /** On database purge */
     PURGE: 6,
     /** On database mark */
     MARK: 7,

     // DB types
     IODB: 1,
     IOCFG: 2,

     /** Object that contains all databases
      * @type {Object}
      */
     openDBs: null,

     /** Object that stores configuration objects. */
     configs: null,

     /** Object that stores configuration schemas. */
     schemas: null,

     unloadModule: function ()
     {
         for (var x in this.openDBs)
         {
            this.closeDB(x);
         }
     },



     loadModule: function ()
     {
         if (!sys.fileExists("js_databases")) sys.mkdir("js_databases");
         this.openDBs = new Object;
         this.configs = new Object;
         this.script.registerHandler("step", this);



         this.configs.io = this.openDB("io.config");

         this.config = this.configs.io;


         if (!this.configs.io.autosave) this.configs.io.autosave = 3600000;
         if (!this.configs.io.autosavemethod) this.configs.io.autosavemethod = "commit";

         this.registerIOWatcher = this.util.generateRegistor(this, this.util.UNARY_REGISTOR, "IOWatchers");
     },

     /** Registers the module's module.config property.
      * @param module The "this" modules to apply the function to.
      * @param defs The default configuration
      */
     registerConfig: function (module, defs, direct)
     {
         if (direct)
         {
             this.configs[module.modname] = defs;
             module.config = defs;
             return;
         }

         if (!this.configs[module.modname]) this.configs[module.modname] = this.openDB(module.modname + ".config");

         for (var x in defs)
         {
             if (! (x in this.configs[module.modname]) ) this.configs[module.modname][x] = defs[x];
         }

         module.config = this.configs[module.modname];

     },

     /** (Unimplemented) Registeres a module's config and related schema information.
      *
      */
     registerConfig2: function (module, schema)
     {
         //
     },


     /** Calls the configure events.
      * @param modname What module to call.
      */
     callConfigureHooks: function (modname)
     {
         if (this.script.modules[modname].configureEvent)
         {
             this.script.modules[modname].configureEvent();
         }
     },

     registerDB: function (module, dbname, dboptions)
     {
         var io = this, dataText, db;

         module.onUnloadModule(
             function()
             {
                 io.closeDB(dbname);
             }
         );

         return this.openDB(dbname);

         // v2



         //return this.openDB(dbname, dboptions);
     },

     registerDatabase2: function (module, dbname, dboptions)
     {
         var dataText, db, test;

         if (this.openDBs[dbname]) throw new Error("??");

         if (sys.fexists("js_databases/" + dbname + ".jsdb"))
         {
             dataText = sys.read("js_databases/" + dbname + ".jsdb");

             test = this.zjdata.parse(dataText, null, true);

             db = test.variant;

             if (test.error)
             {
                 this.script.error(test.error);
             }

         }

         if (!dboptions)
         {
             dboptions = {
                 journaled: true,
                 transactional: false
             };
         }

         this.openDBs[dbname] =
             {
                 db: db,
                 dataText: dataText,
                 type: type,
                 lastSave: +new Date,
                 lastCommit: +new Date
             };

         return db;
     },


     /** Opens a database
      * @returns {IOdatabase}
      */
     openDB: function (dbname, dboptions)
     {
         if (! dboptions) dboptions = new Object;
         var start = +new Date;
         var end;
         if (dbname in this.openDBs)
         {
             return this.openDBs[dbname].db;
         }
         var db, patches, dbo, dataText;

         get_data:
         {
             if (!sys.fileExists("js_databases/" + dbname + ".jsqz"))
             {
                 db = new Object;
                 sys.writeObject("js_databases/" +dbname + ".jsqz", db, 9);
                 break get_data;
             }
             else
             {
                 db = sys.readObject("js_databases/" + dbname + ".jsqz");
             }

             if (!sys.fileExists("js_databases/" + dbname + ".jsqz.transactions")) break get_data;

             this.logs.logMessage(this.logs.IO, "Applying patches to database " + dbname);

             dataText = this.zsrx.zsrx(db, null, 1);

             patches = sys.read("js_databases/" + dbname + ".jsqz.transactions").split(/\n/g);

             if (patches[patches.length - 1] === "") patches.pop();

             try
             {
                 for (var x in patches)
                 {
                     var parsed = JSON.parse(patches[x]);
                     {
                         dataText = this.dmp.def.patch_apply(parsed, dataText)[0];
                     }
                 }
             }
             catch(e)
             {
                 print(JSON.stringify(patches));
                 print(dataText);
                 throw e;
             }


	     try
             {
                 db = JSON.parse(dataText);
             }
             catch(e)
             {
                 print(dataText);
                 throw e;
             }

             sys.writeObject("js_databases/" +  dbname + ".jsqz", db, 3);

             sys.rm("js_databases/" + dbname + ".jsqz.transactions");
         }

         if (!dataText) dataText = this.zsrx.zsrx(db);

         dbo = { db: db, lastSave: +new Date, lastCommit: +new Date, dataText: dataText, hasChanges:null };

         this.openDBs[dbname] = dbo;

         end = +new Date;


         for (var x in this.IOWatchers) try {
             this.IOWatchers[x](dbname, this.OPEN, (end-start));
         } catch (_) {}
         // this.logs.logMessage(this.logs.IO, "Opened database " + dbname + ", took " + (end - start) + "ms.");

         return db;
     }
     ,
     /** Writes all changes to file */
     flushDB: function (dbname)
     {
         var metadb = this.openDBs[dbname];
         var db = metadb.db;
         var start = +new Date;

         sys.writeObject("js_databases/" + dbname + ".jsqz", db, 3);
         if (metadb.hasChanges === true) metadb.hasChanges = false;
         metadb.dataText = JSON.stringify(db, null, 1);
         if (sys.fileExists("js_databases/" + dbname + ".jsqz.transactions")) sys.rm("js_databases/" + dbname + ".jsqz.transactions");

         metadb.lastSave = +new Date;
         var end = +new Date;
         for (var x in this.IOWatchers) try {
             this.IOWatchers[x](dbname, this.SYNC, (end-start));
         } catch (_) {}
     }
     ,
     /** Commits all changes to file, this may be slower or faster than flush depending on the computer. Fast CPU: Use commit; Fast disk: Use flush. */
     commitDB: function (dbname)
     {

         var start = +new Date;

         var newData = this.zsrx.zsrx(this.openDBs[dbname].db);

         if (newData === this.openDBs[dbname].dataText) return;

         var patch = this.dmp.def.patch_make(this.openDBs[dbname].dataText, this.dmp.def.diff_lineMode_(this.openDBs[dbname].dataText, newData));

         sys.append("js_databases/" + dbname + ".jsqz.transactions", this.zsrx.zsrx(patch).replace(/\n/g, " ") + "\n");

         this.openDBs[dbname].dataText = newData;

         var end = +new Date;

         for (var x in this.IOWatchers) try {
             this.IOWatchers[x](dbname, this.COMMIT, (end-start));
         } catch (e) { this.logs.logMessage(this.logs.ERROR, "I/O Watcher error: " + e.toString(), e.backtracetext); }
     },

     /** Marks a database as changed */
     markDB: function (dbname)
     {
         this.openDBs[dbname].hasChanges = true;
         for (var x in this.IOWatchers) try {
             this.IOWatchers[x](dbname, this.MARK, 1);
         } catch (_) {}
     },

     /** Closes an open database */
     closeDB: function (dbname)
     {
         var metadb = this.openDBs[dbname];
         var db = metadb.db;

         if (!db) return;
         var start = +new Date;
         sys.writeObject("js_databases/" + dbname + ".jsqz", db, 8);

         if (sys.fileExists("js_databases/" +dbname + ".jsqz.transactions")) sys.rm("js_databases/" + dbname + ".jsqz.transactions");

         delete this.openDBs[dbname];
         var end = +new Date;

         for (var x in this.IOWatchers) try {
             this.IOWatchers[x](dbname, this.CLOSE, (end-start));
         } catch (_) {}

     },

     /** Erase database */
     purgeDB: function (dbname)
     {


         this.logs.logMessage(this.logs.IO, "Purging DB " + dbname);

         if (this.openDBs[dbname]) this.openDBs[dbname].db = new Object;

         if (sys.fileExists("js_databases/" + dbname + ".jsqz")) sys.rm("js_databases/" + dbname + ".jsqz");
         if (sys.fileExists("js_databases/" + dbname + ".jsqz.transactions")) sys.rm("js_databases/" + dbname + ".jsqz.transactions");

     }
     ,
     backupDB: function (dbname)
     {
         var metadb = this.openDBs[dbname];
         var db = metadb.db;
         var start = +new Date;
         var backupname = dbname + ".backup."+start+".jsqz.bak";
         sys.writeObject("js_databases/" + backupname, db, 9);
         var end = +new Date;
         for (var x in this.IOWatchers) try {
             this.IOWatchers[x](dbname, this.BACKUP, (end-start));
         } catch (_) {}
     }
     ,
     step: function ()
     {
         var now = +new Date;
         if (this.config.autosave) for (var x in this.openDBs)
         {
             if (this.openDBs[x].lastSave + this.config.autosave <= now)
             {
                 var start = +new Date;
                 if (this.config.autosavemethod === "commit")
                 {
                     this.commitDB(x);
                 }
                 else
                 {
                     this.flushDB(x);
                 }
                 var end = +new Date;

                 this.openDBs[x].lastSave = +new Date;

                 return;
             }
         }
     }

 });

/** The event run post-configure.
 * @event
 * @memberOf Module.prototype
 * @name configureEvent
 */

/** Implements configuration schemas
 * @name Schema
 * @class
 */
/**
 * @name
 */