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
/** Modprobe
 * @memberOf script.modules
 * @name modprobe
 * @namespace
 */
/** @scope script.modules.modprobe */
({
     require: ["commands", "logs", "com", "theme", "less", "user"]
     ,
     loadModule: function ()
     {
         this.commands.registerCommand("modprobe", this);
     }
     ,
     /** The modprobe command loads and unloads modules. See the user manual.
      * @type commandDescriptor
      */
     modulectrl:
     {
         server: true,
         desc: "Manages loadable modules. If run without any option, lists modules.",
         options :
         {
             "load": "Loads modules."
             ,
             "unload": "Unloads modules."
             ,
             "reload": "Reloads modules, will attempt to hotswap if possible."
             ,
             "hotswap": "Hotswaps modules (does not reload if hotswapping is not possible.)"
         }
         ,
         perm: "MODPROBE",
         /** The modprobe command will list all the modules, or --load, --unload, or --reload them */
         code: function (src, cmd, chan)
         {
             var flags = Object.keys(cmd.flags);

             if (flags.length === 0)
             {
                 var k = Object.keys(this.script.modules);

                 this.com.message(src, "Loaded Modules: " + k.join(" , ") + " .");
                 return;

                 if (cmd.args.length === 0)
                 {
                     this.com.message([src], "Statted modules:", this.theme.INFO);
                     var modlist = "Loaded Modules: <br/><table><tr><td><b>Module Name:</b></td><td><b>Module State:</b></td></tr><br/>";
                     for (var x in this.script.modInfo)
                     {
                         modlist += "<tr><td>" + x + "</td><td>" + this.script.modInfo[x].state + "</td></tr>";
                     }

                     this.com.message(src, modlist + "</table>", this.theme.INFO, true);
                     return;
                 }

                 var str = [];

                 for (var x in cmd.args)
                 {

                     var test = this.script.modules[cmd.args[x]];

                     str.push("<b>Module " + cmd.args[x] + ":</b>");
                     if (!test)
                     {
                         str.push("Module not loaded.");
                         continue;
                     }

                     str.push("Requires: " + this.script.modules[cmd.args[x]].require.join(", "));
                     str.push("Required by: " + this.script.modules[cmd.args[x]].submodules.join(", "));
                     str.push("Contains: " + Object.keys(this.script.modules[cmd.args[x]]).join (", "));

                 }

                 this.less.less(src, str.join("<br/>"), true);

                 return;
             }

             if (cmd.flags.load || cmd.flags.l) for (var x in cmd.args) this.script.loadModule(cmd.args[x]);

             if (cmd.flags.unload || cmd.flags.u) for (var x in cmd.args) this.script.unloadModule(cmd.args[x]);

             if (cmd.flags.reload || cmd.flags.r) for (var x in cmd.args) this.script.reloadModule(cmd.args[x]);

             if (cmd.flags.hotswap || cmd.flags.h) for (var x in cmd.args)
             {
                 if (!this.script.hotswapModule(cmd.args[x]))
                 {
                     this.com.message(src, "Failed to hotswap module: " + cmd.args[x], this.theme.WARN);
                 }
             }
         }
     }
 });
