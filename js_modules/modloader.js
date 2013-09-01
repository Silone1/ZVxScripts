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
     modules: null,

     moduleTable: null,

     sources: null,

     init: function ()
     {
         this.sources = new Array;

         this.modules = new Object;

         this.moduleTable = new Object;
     },

     addSource: function (source)
     {
         this.sources.push(source);
     },


     fetch: function (modname, source)
     {
         if (source.type === "local")
         {
             if (source.modules && source.modules.indexOf(modname) === -1) return null;

             try
             {
                 var text = sys.read(source.path + "/" + modname + ".js");

                 if (!source.sha1 || source.sha1[modname] === sys.sha1(text)) return text;


                 try
                 {
                     this.modules.logs.logMessage(this.modules.logs.WARN, "Invalid sha1 string for module.");
                 }
                 catch (_)
                 {
                     print("Invalid sha1 string for module.");
                 }
                 return null;

             }
             catch (e)
             {
                 return null;
             }
         }

         if (source.type === "web")
         {
             if (source.modules && source.modules.indexOf(modname) === -1) return null;

             var text = sys.synchronousWebCall(source.path + "/"+modname + ".js");

             if (!text) return null;

             if (!source.sha1 || source.sha1[modname] === sys.sha1(text)) return text;

             try
             {
                 this.modules.logs.logMessage(this.modules.logs.WARN, "Invalid SHA1 string for module.");
             }
             catch (_)
             {
                 print("Invalid SHA1 string for module.");
             }
             return null;

         }

         else return null;
     },

     statModule: function (modname)
     {
         // TODO: fix this

         var stat = {
             state: "unloaded",
             text: null
         };

         for (var x in this.sources)
         {
             if (this.sources.modules && this.sources[x].modules.indexOf(modname) !== -1)
             {
                 stat.source = this.sources[x];

                 return stat;
             }

             var text;
             if (!this.sources.modules && (text = this.fetch(modname, this.sources[x])))
             {
                 stat.source = this.sources[x];
                 stat.text = text;

                 return stat;
             }
         }

         return null;
     },

     loadModule: function (modname)
     {
         var modinf = this.moduleTable[modname];

         if (!modinf) modinf = this.moduleTable[modname] = this.statModule(modname);

         if (!modinf) return; // failure

         if (modinf.state === "loaded" || modinf.state === "error") return;

         if (modinf.state === "ready" || modinf.state === "pending")
         {
             this.enableModule(modname, modinf.code);
             return;
         }

         if (modinf.state === "unloaded")
         {

             var text = modinf.text || this.fetch(modname, modinf.source);

             if (!text) return;

             var code = null;
             var extratext = null;
             var extra;

             try
             {
                 try { code = sys.eval(text, modinf.source.path +"/"+ modname + ".js"); }
                 catch(_) { code = sys.eval(text); }

                 if (code.include) for (var x in code.include)
                 {
                     var i = code.include[x];

                     extratext = this.fetch(code.include[x], modinf.source);

                     if (!extratext) return;

                     try { extra = sys.eval(extratext, modinf.source.path +"/"+ modname + ".js"); }
                     catch(_) { extra = sys.eval(extratext); }

                     this.fuse(code, extra);
                 }

                 extra = null; extratext = null;

                 if (code.initializeModule) code.initializeModule();

                 modinf.code = code;
                 modinf.pendingCode = null;

                 if (this.enableModule(modname, modinf.code))
                 {
                     modinf.state = "loaded";

                     if (this.log) this.log("Loading module " + modname);
                 }
                 else
                 {

                     modinf.state = "error";
                     print("error");
                 }


             }
             catch(e)
             {
                 modinf.state = "error";
                 print(e);
             }

         }
     },

     registerHandler: function registerHandler (handlername, object, propname)
     {
         if (!propname) propname = handlername;

         if (! (handlername in this))
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

             this[handlername] = f;
             this[handlername].callbacks = [];
         }

         if ( !(this[handlername].callbacks)) throw new Error("Not registerable");

         var callbk = {func:object[propname], bind:object};

         this[handlername].callbacks.push(callbk);

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

     /** Enables a module: Takes the module object and glues it into to the system.
      * @param modname The name of the module
      * @param module The module object
      */
     enableModule: function (modname, module)
     {
         var x;

         module.submodules = [];
         Object.defineProperty(module, "script", {value: this, configurable: true});

         this.modules[modname] = module;

         if (!module.require) module.require = [];

         for (x in module.require)
         {
             var i = module.require[x];

             delete module[i]; // clean up old refs

             this.loadModule(i);

             if (!this.moduleTable[i] || this.moduleTable[i].state !== "loaded" || !this.modules[i])
             {
                 this.moduleTable[modname].state = "pending";

                 delete this.modules[modname];

                 return false;

             }


             if (this.modules[i].submodules.indexOf(modname) !== -1) throw new Error("Corrupt module system.");

             // Add this module to submodules of the other module
             this.modules[i].submodules.push(modname);

             // Apply requirements:
             Object.defineProperty(this.modules[modname], i, {configurable: true, value: this.modules[i]});

         }


         for (x in this.hooks)
         {
             module[x] = this.hooks[x];
         }


         for (x in module.require)
         {
             var i = module.require[x];

             if (this.modules[i].loadSubmodule) this.modules[i].loadSubmodule(modname, module);
         }


         if (module.loadModule) module.loadModule();

         return true;

     },

     unloadModule: function (modname)
     {
         var x;

         if (! (modname in this.modules)) return;

         var disabled = [];

         var module = this.modules[modname];

         var submodules = [];

         for (x in module.submodules) submodules.push(module.submodules[x]);

         for (x in submodules) disabled = disabled.concat(this.unloadModule(submodules[x]));

         if (module.unloadModule) module.unloadModule();

         if (module.unloadModuleHooks)
         {
             var unloadModuleHooks = module.unloadModuleHooks;

             for (x in unloadModuleHooks)
             {
                 unloadModuleHooks[x].apply(new Object, [module]);
             }

         }


         delete this.modules[modname];

         this.moduleTable[modname].state = "ready";

         if (this.log) this.log("Unloaded module: " + modname);

     },

     fuse: function (origin, extra)
     {
         for (var x2 in extra)
         {
             if (x2 in origin && origin[x2] != null)
             {
                 if (typeof origin[x2] != typeof extra[x2] || (typeof origin[x2] != "object" && typeof origin[x2] != "function"))
                 {
                     throw new Error("Unable to merge");
                 }
                 if (typeof origin[x2] === "function")
                 {
                     // use a closure to merge the two functions as one
                     origin[x2] = (function (a, b) {
                                    return function ()
                                    {
                                        a.apply(origin, arguments);
                                        b.apply(origin, arguments);
                                    };
                                })(origin[x2], extra[x2]);
                 }
                 else if (origin[x2] instanceof Array)
                 {
                     origin[x2] = origin[x2].concat( extra[x2] );
                 }
                 else
                 {
                     for (var x3 in extra[x2])
                     {
                         if (x3 in origin[x2]) throw new Error("Unable to merge");

                         origin[x2][x3] = extra[x2][x3];
                     }
                 }
             }
             else
             {
                 origin[x2] = extra[x2];
             }
         }
     },

     hooks:
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




 });