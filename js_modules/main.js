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
//"use strict";
/**
 * @fileOverview This file is the main modloader.
 * @author <a href="mailto:archzombielord@gmail.com">ArchZombie0x</a>
 */
/** Scripts are loaded using modules.
 * @class
 * @name Module
 */
/** Called when a module is loaded. Should initialize the internal state of the module.
 * @name loadModule
 * @event
 * @memberOf Module.prototype
 */
/** Called when a module is unloaded. Should deinitialize the internal state of the module, at least saving to disk.
 * @name unloadModule
 * @event
 * @memberOf Module.prototype
 */
/** Sets up a call to activate during the unload module event.
 * @name onUnloadModule
 * @function
 * @param callback Function to be called.
 * @memberOf Module.prototype
 */
/** The module loader object
 *  @name script
 *  @namespace
 */
(function () {
     /** @scope script */
     return {


         /* Enums */
         MODULE_UNREADY: ["MODULE_UNREADY"],
         MODULE_PENDING: ["MODULE_PENDING"],
         MODULE_ERROR:   ["MODULE_ERROR"],
         MODULE_READY:   ["MODULE_READY"],
         MODULE_UNLOADED:["MODULE_UNLOADED"],
         MODULE_LOADED:  ["MODULE_LOADED"],

         /** The modules object stores all the modules
          * @namespace
          */
         modules: null,

         /** Various information about modules */
         modInfo: null,



         /** Registers a script event handler
          * @param {string} handlername The event name of the script handler.
          * @param {Module} object The module to register this handler from
          * @param {string} [propname=handlername] The name of the handler on the module, if it is different from the event name.
          * */
         registerHandler: function registerHandler (handlername, object, propname)
         {
             if (!propname) propname = handlername;

             if (! (handlername in script))
             {
                 var f = function _meta_event_handler_func_ ()
                 {
                     try
                     {
                         for (var x in f.callbacks)
                         {
                             f.callbacks[x].func.apply(f.callbacks[x].bind, arguments);
                         }
                     }

                     catch (err)
                     {
                         this.error(err);
                     }
                 };

                 script[handlername] = f;
                 script[handlername].callbacks = [];
             }

             if ( !(script[handlername].callbacks)) throw new Error("Not registerable");

             var callbk = {func:object[propname], bind:object};

             script[handlername].callbacks.push(callbk);

             var _bind = this;
             if ("onUnloadModule" in object)
             {
                 object.onUnloadModule(
                     function _meta_callback_unload_ ()
                     {
                         script[handlername].callbacks.splice(script[handlername].callbacks.indexOf(callbk),1);
                     }
                 );
             }

             return;

         },



         hotswapModule: function (modname)
         {
             var oldmod = this.modules[modname];

             if (!oldmod) return false;

             if (!oldmod.hotswap) return false;

             var newMod = sys.exec("js_modules/" + modname + ".js");

             if (!newMod.hotswap) return false;

             this.log("Hotswapping module: " + modname);

             Object.defineProperty(newMod, "script", {value: this, configurable: true});

             for (var x in newMod.require)
             {
                 this.loadModule(newMod.require[x]);
                 Object.defineProperty(newMod, newMod.require[x], {value: this.modules[newMod.require[x]], configurable: true});
                 if (this.modules[newMod.require[x]].submodules.indexOf(modname) == -1) this.modules[newMod.require[x]].submodules.push(modname);
             }

             function nil(){};

             switch (typeof newMod.hotswap)
             {
             case "function":
                 if (newMod.hotswap(oldmod))
                 {
                     if (oldmod.submodules) for (var x in oldmod.submodules)
                     {
                         delete this.modules[oldmod.submodules[x]][modname];
                         Object.defineProperty(this.modules[oldmod.submodules[x]], modname, {value: newMod, configurable: true});
                     }

                     newMod.submodules = this.modules[modname].submodules;

                     this.modules[modname] = newMod;


                     return true;
                 }
                 else return false;
             case "boolean":
                 (oldmod.unloadModule || nil) ();

                 if (oldmod.submodules) for (var x in oldmod.submodules)
                 {
                     delete this.modules[oldmod.submodules[x]][modname];
                     Object.defineProperty(this.modules[oldmod.submodules[x]], modname, {value: newMod, configurable: true});
                 }

                 newMod.submodules = oldmod.submodules;
                 this.modules[modname] = newMod;
                 (newMod.loadModule || nil)();
                 return true;
             default:
                 return false;
             }
         },



         /** Reloads a module
          * @param {string} modname
          * @throws Error When the module can't be loaded.
          * */
         reloadModule: function reloadModule (modname)
         {
             // if(this.hotswapModule(modname)) return; // try hotswap if possible

             var unloads = this.unloadModule(modname);

             for (var x in unloads)
             {
                 this.loadModule(unloads[x]);
             }

             this.loadModule(modname); // load even if unload failed
         },


         statModule: function (modname, nfo)
         {
             this.scriptinfo("Statting module " + modname +".", sys.backtrace());
             this.modInfo[modname] = nfo;

             nfo.state = this.MODULE_UNREADY;
         },


         /** Updates source code for the module
          * @param modname What module to update
          */
         sourceModule: function (modname)
         {
             this.scriptinfo("Request to source module " + modname +".", sys.backtrace());
             var nfo = this.modInfo[modname];


             if (!nfo) throw new Error("Module not statted.");


             if (nfo.type == "local")

             {
                 var code = sys.read(nfo.path);

                 if (!code)
                 {
                     this.scriptinfo("Error aquiring source for module " + modname +".", sys.backtrace());
                     return; // failure
                 }

                 nfo.code = code;
                 nfo.state = this.MODULE_PENDING;

                 return;
             }

             this.scriptinfo("Error aquiring source for module " + modname +".", sys.backtrace());
         },

         deactivateModule: function (modname)
         {
             var nfo = this.modInfo[modname];

             if (!nfo) return;

             if (nfo.state == this.MODULE_LOADED)

             {
                 if (nfo.module.unloadModule) nfo.module.unloadModule();
             }
         },
         /** Changes a pending module into a ready module
          *
          */
         evaluateModule: function (modname)
         {
             this.scriptinfo("Request to evaluate " + modname +".", sys.backtrace());
             var nfo = this.modInfo[modname];

             if (!nfo) throw new Error("Module not statted.");

             if (!nfo.code) throw new Error("No source for this module");

             try
             {
                 nfo.module = sys.eval(nfo.code, nfo.path);

                 nfo.state = this.MODULE_READY;
             }
             catch (e)
             {
                 this.scriptinfo("Error evaluating source for module " + modname +":" + e.toString(), e.backtracetext);
                 return;
             }

             this.scriptinfo("Evaluated module " + modname +".", sys.backtrace());

         },

         initializeModule: function (modname)
         {
             var nfo = this.modInfo[modname];

             if (!nfo) throw new Error("Module not statted.");

             if (nfo.module.init) nfo.module.init();


             if (!nfo.module.require) nfo.module.require = [];

             nfo.state = this.MODULE_UNLOADED;
         },

         activateModule: function (modname)
         {
             this.scriptinfo("Request for activating module " + modname + ".", sys.backtrace());
             var nfo, x;

             nfo = this.modInfo[modname];

             if (!nfo) throw new Error("Module not statted.");

             nfo.module.submodules = [];

             for (x in this.hooks)
             {
                 nfo.module[x] = this.hooks[x];
             }


             for (x in nfo.module.require)
             {
                 var reqmodname = nfo.module.require[x];

                 this.loadModule(reqmodname);

                 if ( this.modInfo[reqmodname].state !== this.MODULE_LOADED )
                 {
                     this.scriptinfo("Error in activating module " + modname + ", "+reqmodname+" responded to loadModule with "+this.modInfo[reqmodname].state+".", sys.backtrace());
                     return; // error
                 }

                 this.modules[reqmodname].submodules.push(modname);

                 if (this.modules[reqmodname].submodules.indexOf(modname) === -1) throw new Error(":(");

                 Object.defineProperty(nfo.module, reqmodname, {configurable: true, value: this.modules[reqmodname]});
             }

             Object.defineProperty(nfo.module, "script", {configurable : true, value: this});

             this.modules[modname] = nfo.module;

             if ("loadModule" in nfo.module)
             {
                 try
                 {
                     this.modules[modname].loadModule();
                 }
                 catch(e)
                 {
                     this.scriptinfo("Error in activating module " + modname + ", error in loadModule method: " + e.toString(), e.backtracetext);
                     return;
                 }
             }

             this.scriptinfo("Activated module " + modname + ".", sys.backtrace());
             this.modInfo[modname].state = this.MODULE_LOADED;
         },

         /** Loads a module
          * @param {string} modname Name of the module to be loaded.
          */
         loadModule: function loadModule (modname)
         {

             var code, nfo;

             nfo = this.modInfo[modname];

             if (!nfo) throw new Error("Module not statted.");


             if (nfo.state == this.MODULE_LOADED) return;


             if (nfo.state == this.MODULE_UNREADY)
             {
                 this.sourceModule(modname);
             }


             if (nfo.state == this.MODULE_ERROR || nfo.state == this.MODULE_PENDING)
             {
                 this.evaluateModule(modname);
             }

             if (nfo.state == this.MODULE_READY)
             {
                 this.initializeModule(modname);
             }

             if (nfo.state == this.MODULE_UNLOADED)
             {
                 this.activateModule(modname);
             }

             if (nfo.state == this.MODULE_LOADED) this.log("Loaded module " + modname +".", sys.backtrace());

             return;
         }
         ,
         /** Unloads a module
          * @param {string} modname Name of module to remove.
          * @return {string[]} List of all modules that were removed, includes others due to dependencies.
          */
         unloadModule: function unloadModule (modname, hot)
         {
             if ( !(modname in this.modules)) return [];
             if (this.modules[modname] instanceof Error) return [modname];
             this.log("Unloading module: " + modname);

             try
             {



                 var unloads = [modname];

                 var thisModule = this.modules[modname];

                 var q = [];

                 thisModule.submodules.forEach(function (i){ q.push(i); });

                 for (var x in q)
                 {
                     unloads.push(q[x]);
                     var u = this.unloadModule(q[x]);
                     unloads = unloads.concat(u);

                 }

                 if (thisModule.require) for (x in thisModule.require)
                 {
                     if (this.modules[thisModule.require[x]].unloadSubmodule)
                     {
                         this.modules[thisModule.require[x]].unloadSubmodule(thisModule, modname);
                     }

                     this.modules[thisModule.require[x]].submodules.splice(this.modules[thisModule.require[x]].submodules.indexOf(modname), 1);
                 }

                 if ("unloadModuleHooks" in thisModule)
                 {
                     var unloadModuleHooks = thisModule.unloadModuleHooks;
                     for (x in unloadModuleHooks)
                     {
                         unloadModuleHooks[x].apply(thisModule, [thisModule]);
                     }

                 }

                 if ("unloadModule" in thisModule) try
                 {
                     thisModule.unloadModule();
                 }
                 catch (e)
                 {
                     this.log("[[ERROR:]]" + e.toString() + "\n" + e.backtracetext);
                 }
             } catch (e2)
             {

             }
             finally
             {
                 delete this.modules[modname];
                 this.modInfo[modname].state = this.MODULE_UNLOADED;
                 return unloads;
             }




         }
         ,
         /** Handles loading the script
          * @event
          */
         loadScript: function loadScript ()
         {
             var test1, test2, x, poisoned;
             
             sys.clearChat();
             sys.enableStrict();
             sys.unsetAllTimers();

             test1 = ["print","gc","version","global","sys","SESSION","Qt","script"];

             test2 = Object.keys(global);

             poisoned = false;



             this.modules = new Object;
             this.modInfo = new Object;

             print(sys.read("ZVXSCRIPTS_COPYING"));

             for (x in test2) if (test1.indexOf(test2[x]) === -1)
             {
                 print("WARNING: Global object poisoned. Removing property: " + test2[x]);
                 delete global[test2[x]];
                 poisoned = true;
             }

             if (poisoned) gc();

             this.registerHandler("beforeLogIn", this, "AGPL");



             try
             {
                 var files = sys.filesForDirectory("js_modules");

                 for ( x in files)
                 {

                     if (!files[x].match(/^#.*#$|~$|\.bak$/))
                     {
                         //print("statting " + files[x]);
                         this.statModule(files[x].replace(/\.js$/, ""), { type: "local", path: "js_modules/" + files[x]});
                     }
                 }

                 this.loadModule("default");

                 //this.log(this.modInfo["default"].state);
             }
             catch(e)
             {
                 var stack = (e.backtracetext);

                 this.error("Failed to start, error in " + e.fileName + " at line #" + e.lineNumber + ": " + e.toString());
                 sys.stopEvent();
             }
         },


         /** Handles unloading the script
          * @event
          */
         unloadScript: function unloadScript ()
         {
             var mods = Object.keys (this.modules);

             for (var x in mods)
             {
                 this.unloadModule(mods[x]);
             }
         },


         /** Sends a license message to src
          * @param {number} src User ID to send message to.
          */
         AGPL: function AGPL (src)
         {
             sys.sendHtmlMessage(
                 src,
                 "<timestamp /><b>ZVxScripts Copyright © 2013 Ryan P. Nicholl \"ArchZombie0x\" &lt;archzombielord@gmail.com&gt;</b><br/>" +
                     "You may download these scripts for your own server at <a href=\'https://github.com/ArchZombie/zvxscripts\'>https://github.com/ArchZombie/zvxscripts</a> <a href='https://github.com/ArchZombie/zvxscripts/archive/master.zip'>[link to .zip]</a>, or if this is incorrect, using <em>/getsource</em>. Scripts are available under the <em>GNU Affero General Public License</em> as published by the Free Software Foundation, version 3, or, at your option, any later version."
             );
         },

         /** Hooks to be added to all modules
          *
          */
         hooks:
         /**
          * @scope script.hooks
          */
         {
             /** Runs the function when the module is unloaded
              * @param {function} f Function to be run when the module is unloaded.
              */
             onUnloadModule: function _meta_hook_onUnloadModule_ (f)
             {
                 if (!this.unloadModuleHooks) this.unloadModuleHooks = [];

                 this.unloadModuleHooks.push(f);
             }

         },



         debugInspector: function ()
         {
             function assert (cond)
             {
                 if (!cond)
                 {
                     print("ASSERT FALURE");
                     print(sys.backtrace());
                     throw new Error("Assert failure.");
                 }
             }

             for (var x in this.modules)
             {
                 for (var x2 in this.modules[x].require)
                 {
                     (function(x, x2) {

                          var name = this.modules[x].require[x2];
                          assert(this.modules[name].submodules.indexOf(x) !== -1);

                      }).call(this, x, x2);
                 }
             }

         },


         debug: function (m)
         {
             print(m);
         },



         /** Logs a message to the console or the logging module*/
         log: function log (msg)
         {
             print ("SCRIPT: " + msg);
         },

         scriptinfo: function log (msg, bt)
         {
             //print ("SCRIPT: " + msg);
         },


         error: function _err_ (e)
         {
             print("SCRIPTERROR: " + e + "\n" + e.backtracetext);
         },


         /** Does nothing
          * @deprecated Doesn't do anything
          */
         broadcast : function _DEPRECATED_ (msg)
         {

         }



     };})();
