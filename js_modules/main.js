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
         /** Holds some very basic configuration */
         config: null
         ,
         /** The modules object stores all the modules
          * @namespace
          * @memberOf script
          */
         modules: null
         ,
         modInfo: null
         ,
         debug: function (m)
         {
             print(m);
         }
         ,
         /** Logs a message to the console or the logging module*/
         log: function log (msg)
         {
             print ("SCRIPT: " + msg);
         }
         ,
         error: function _err_ (e)
         {
             print("SCRIPTERROR: " + e);
         }
         ,
         /** Does nothing
          * @deprecated Doesn't do anything
          */
         broadcast : function _DEPRECATED_ (msg)
         {

         }
         ,
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

         }
         ,
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
         }
         ,
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
         }
         ,
         /** Loads a module
          * @param {string} modname Name of the module to be loaded.
          */
         loadModule: function loadModule (modname)
         {
             if (this.modules[modname] && !(this.modules[modname] instanceof Error)) return;


             try {
                 var mod = sys.exec("js_modules/" + modname +".js");

                 mod.modname = modname;

                 this.modules[modname] = mod;

                 if (mod.include) for (var x in mod.include)
                 {
                     var temp = sys.exec("js_modules/" + mod.include[x] + ".js");

                     for (var x2 in temp)
                     {
                         if (x2 in mod && mod[x2] != null)
                         {
                             if (typeof mod[x2] != typeof temp[x2] || (typeof mod[x2] != "object" && typeof mod[x2] != "function"))
                             {
                                 throw new Error("Unable to merge");
                             }
                             if (typeof mod[x2] === "function")
                             {
                                 // use a closure to merge the two functions as one
                                 mod[x2] = (function (m, t) {
                                                return function ()
                                                {
                                                    m.apply(mod, arguments);
                                                    t.apply(mod, arguments);
                                                };
                                            })(mod[x2], temp[x2]);
                             }
                             else if (mod[x2] instanceof Array)
                             {
                                 mod[x2] = mod[x2].concat( temp[x2] );
                             }
                             else
                             {
                                 for (var x3 in temp[x2])
                                 {
                                     if (x3 in mod[x2]) throw new Error("Unable to merge");

                                     mod[x2][x3] = temp[x2][x3];
                                 }
                             }
                         }
                         else
                         {
                             mod[x2] = temp[x2];
                         }
                     }
                 }

                 if (!mod.require) mod.require = [];
                 mod.submodules = [];

                 for (var x in this.hooks)
                 {
                     mod[x] = this.hooks[x];
                 }

                 for (var x in mod.require)
                 {
                     var reqmodname = mod.require[x];

                     this.loadModule(reqmodname);

                     if ( !(reqmodname in this.modules) || this.modules[reqmodname] instanceof Error)
                     {
                         this.modules[modname] = new Error("Unmet dependencies");
                         return;
                     }

                     this.modules[reqmodname].submodules.push(modname);

                     if (this.modules[reqmodname].submodules.indexOf(modname) === -1) throw new Error(":(");

                     Object.defineProperty(this.modules[modname], reqmodname, {configurable: true, value: this.modules[reqmodname]});
                 }

                 Object.defineProperty(this.modules[modname], "script", {configurable : true, value: this});

                 if ("loadModule" in mod)
                 {
                     mod.loadModule();
                 }
                 this.log("Loaded module: " + modname);
             }
             catch (e)
             {

                 delete this.modules[modname];
                 throw e;
             }

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
                 return unloads;
             }




         }
         ,
         /** Handles loading the script
          * @event
          */
         loadScript: function loadScript ()
         {

             var test1 = ["print","gc","version","global","sys","SESSION","Qt","script"];

             var test2 = Object.keys(global);

             var poisoned = false;

             sys.enableStrict();

             this.modules = new Object;

             print(sys.read("ZSCRIPTS_COPYING"));

             for (var x in test2) if (test1.indexOf(test2[x]) === -1)
             {
                 print("WARNING: Global object poisoned. Removing property: " + test2[x]);
                 delete global[test2[x]];
                 poisoned = true;
             }

             if (poisoned) gc();

             this.registerHandler("beforeLogIn", this, "AGPL");

             sys.unsetAllTimers();

             try {
                 var f;
                 if (sys.fileExists("main.json")) f = sys.read("main.json");

                 else f = "{}";

                 var o = JSON.parse(f);

                 if (typeof o == typeof new Object);

                     else throw new Error("Corrupt File");

                 this.config = o;

                 if (!this.config.modules) this.config.modules = ["default"];

                 for ( x in this.config.modules)
                 {
                     this.loadModule(this.config.modules[x]);
                 }

                 sys.writeToFile("main.json", JSON.stringify(this.config));
             }
             catch(e)
             {
                 var stack = (e.backtracetext);

                 print("Failed to start, error in " + e.fileName + " at line #" + e.lineNumber + ": " + e.toString() +"\n" + stack);
                 sys.stopEvent();
             }
         }
         ,
         /** Handles unloading the script
          * @event
          */
         unloadScript: function unloadScript ()
         {
             var mods = Object.keys (this.modules);

             //this.config.modules = Object.keys(this.modules);

             //sys.write("main.json", JSON.stringify(this.config));

             for (var x in mods)
             {
                 this.unloadModule(mods[x]);
             }
         }
         ,
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
         }
         ,
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

         }
         ,
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

         }

     };})();
