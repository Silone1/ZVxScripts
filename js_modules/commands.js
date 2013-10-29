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
/** Commands
 * @name commands
 * @memberOf script.modules
 * @namespace
 * */
/**
 * @name commandDescriptor
 * @class
 */
/** Check for permission.
 * @name perm
 * @memberOf commandDescriptor.prototype
 * @type {Function|String}
 * @param {Number} src User ID
 * @param {Object} cmd Parsed command
 * @param {Number} chan Channel ID
 * @return {Boolean|Object} True/False, or if true, may also be object with cache.
 */
/** Exectutes the command, sometimes ignoring permission. (best to check for permission first)
 * @name code
 * @memberOf commandDescriptor.prototype
 * @function
 * @param {Number} src User ID
 * @param {Object} cmd Parsed command
 * @param {Number} chan Channel ID
 * @param {Object} [cache] Cache object as a result of perm function if applicable. Must not assume this is present.
 */
/** Describes the command
 * @name desc
 * @memberOf commandDescriptor.prototype
 * @type String
 */
/** If the server console can use the command, requires special handling in some cases.
 * @name server
 * @memberOf commandDescriptor.prototype
 * @type Boolean
 * @deprecated
 */
/** Describes the command's options. Key is option name, value is description.
 * @name options
 * @memberOf commandDescriptor.prototype
 * @type {Object.String}
 */
/** Category for /commands
 * @name commands
 * @memberOf commandDescriptor.prototype
 * @type {String}
 */
/** @scope script.modules.commands */
({
     require: ["com", "theme", "parsecommand", "util", "logs", "io", "dmp", "user"],


     dmpO: null,


     /** A list of all the command object descriptors loaded
      * @type {Object.<commandDescriptor>}
      */
     commands_db: new Object,


     /** Error of Permission. */
     PERMISSION_ERROR: new Object,
     FORMAT_ERROT: new Object,

     /** @event */
     loadModule: function ()
     {

         this.dmpO = new this.dmp.constructor();
         this.dmpO.Match_Threshold = 0.5;
         this.dmpO.Match_Distance = 0;
	 this.user.registerConfigHook(this, "userConfiguration");

     },


     userConfiguration: function (conf)
     {
         if (!conf.commandParser || !(conf.commandParser in this.parsecommand.commandParsers)) conf.commandParser = "optargs";
     },


     /** Registeres command.
      * @param {String} name Name of command.
      * @param {Module} object Module object.
      * @param {String} [prop=name] Name of property from module to use
      */
     registerCommand: function (name, object, prop)
     {
         if (name in this.commands_db)
         {
             this.script.log("WARN: Overwriting command " +name);
         }

         var comnd = object[prop || name];
         comnd.bind = object;
         comnd.name = name;

         this.commands_db[name] = object[prop || name];
         //this.commands_db[name].config = this.config.commands[name];

         if (!comnd.category)
         {
             print("WARN: Command /"+comnd.name+ " has no category!");
             comnd.category = "other";
         }

         if (comnd.aliases) for (var x in comnd.aliases)
         {
             this.commands_db[comnd.aliases[x]] = comnd;
         }

         object.onUnloadModule(
             this.util.bind(
                 this,
                 function ()
                 {
                     this.unregisterCommand(name);
                 }
             )
         );
         return;
     },



     /** Unregisters a command
      * @param {String} name Name of command to unregister
      * */
     unregisterCommand: function (name)
     {
         if (this.commands_db[name])
         {
             if (this.commands_db[name].aliases) for (var x in this.commands_db[name].aliases)
             {
                 delete this.commands_db[this.commands_db[name].aliases[x]];
             }
         }
         delete this.commands_db[name];
     },



     serverCanUseCmd: function (name)
     {
         return this.commands_db[name].server;
     },



     /** Checks if player has permission to use a command
      * @param {Number} src Player ID.
      * @param {parsedCommand} cmd
      * @param {Number} chan Channel ID.
      */
     commandPerm: function (src, cmd, chan)
     {
         var cmdobj = this.commands_db[cmd.name];

         if (src == 0) return cmdobj.server;

         if (this.user.hasPerm(src, "COMMAND[" + cmdobj.name.toUpperCase() + "]")) return true;

         else if (typeof cmdobj.perm == "string")
         {
             return this.user.hasPerm(src, cmdobj.perm);
         }
         else if (typeof cmdobj.perm == "boolean")
         {
             return cmdobj.perm;
         }
         else if (cmdobj.perm === undefined)
         {
             return false;
         }
         else
         {

             return (cmdobj.perm || cmdobj.perm2).call(cmdobj.bind, src, cmd, chan);
         }
     },


     tryCommand: function(src, cmd, chan)
     {
         var cmd_obj = this.commands_db[cmd.name];

         if (!cmd_obj)
         {
             this.com.message([src], "Command \""+cmd.name+"\": Command does not exist.", this.theme.WARN);

             if (1) // bugfix
             {
                 var matches = [];

                 for (var x in this.commands_db) if (this.dmpO.match_main(x, cmd.name, 0) != -1)
                 {
                     matches.push(x);
                 }

                 if (matches.length) this.com.message(src, "Did you mean one of these?: " + matches.join(", ") + "?");

             }

             return;
         }

         var perm = this.commandPerm(src, cmd, chan);

         if (!perm)
         {
             this.com.message(src, "Command \""+cmd.name+"\": Permission denied.", this.theme.WARN);

             var matches = [];

             for (var x in this.commands_db) if (x != cmd.name && this.dmpO.match_main(x, cmd.name, 0) != -1 && this.commandPerm(src, {name:x, flags: {}, args: []}, chan))
             {
                 matches.push(x);
             }

             if (matches.length) this.com.message(src, "Did you mean one of these?: " + matches.join(", ") + "?");

             return;
         }

         try
         {
             var retval = cmd_obj.code.call(cmd_obj.bind, src, cmd, chan, (perm === true ? void 0 : perm));
             if (retval)
             {
                 if (retval.status === this.PERMISSION_ERROR)
                 {

                     this.com.message(src, "Error: No permission for " + (retval.perm || "?")  + "!");

                 }

             }
         }
         catch (e)
         {
             this.script.error(e);
         }
     },


     /** Parses text from a user as a command, checks relevant permissions etc.
      * @event
      * @param src User ID
      * @param text Unparsed text object
      * @param chan Channel ID
      */
     issueCommand: function(src, text, chan)
     {
         var cmd = this.parsecommand.commandParsers[this.user.userConfig(src).commandParser](text);

         this.logs.logMessage(this.logs.COMMAND, (chan == -1 ? "[N/A] " : "[#"+sys.channel(chan)+"] ") + this.user.name(src) + ": " + text);

         this.tryCommand(src, cmd, chan);
     },

     loadSubmodule: function (md)
     {
         if (md.meta && md.meta.commands)
         {
             for (var x in md.meta.commands)
             {
                 this.registerCommand(md.meta.commands[x], md);
             }
         }
     }
 });
