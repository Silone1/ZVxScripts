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
/** Command parser
 * @name parsecommand
 * @memberOf script.modules
 * @namespace
 * */
/** A parsed command
 * @name parsedCommand
 * @class
 */
/** A list of all the arguments
 * @name args
 * @memberOf parsedCommand.prototype
 * @type Array
 */
/** A list of all the flags
 * @name flags
 * @memberOf parsedCommand.prototype
 * @type Object
 */
/** @scope script.modules.parsecommand */
({
     require: [],


     hotswap: true,


     commandUnParsers:
     {
         optargs: function (cmd)
         {
             var output = [];
             for (var x in cmd.args)
             {
                 output.push(JSON.stringify(cmd.args[x]));
             }

             for (var x in cmd.flags)
             {
                 output.push("--" + x + (cmd.flags[x] === true?"":"="+ JSON.stringify(cmd.flags[x])));
             }

             return output.join(" ");
         },

         simple: function (cmd)
         {
             var output = [];

             var string = "";
             for (var x in cmd.args)
             {
                 output.push(cmd.args[x].replace(/[\:\*\\]/g, "\\$1"));
             }

             string = output.join("*");

             for (x in cmd.flags)
             {
                 string += (":" + x + (cmd.flags[x] === true?"":"="+ (cmd.flags[x]).replace(/[\:\*\\]/g, "\\$1")));
             }

             return string;
         }
     },

     commandParsers:
     {
	 optargs: null,
	 simple: function (text)
	 {
	      var cmd = new Object;

             var match = text.match(/^(?:!|\/)([^\s]*)(?:\s+(.*))?/i);

             cmd.args = [];
             cmd.flags = {};

             if (!match) return cmd;

             cmd.name = match[1];
             cmd.input = match[2];

             var input = cmd.input;

             if (!input) return cmd;

             while (input != (input =
			      input.replace(/^[\s\*]*(?:\:((?:[^\s:\*=]|\\.)+)(?:\=(?:\"((?:\\.|[^\"])+)\"|((?:[^:\*"]|\\.)+)))?)|(?:(?:\"((?:\\.|[^\"])+)\")|((?:[^:\*]|\\.)+))/, cl_next))
		    //                           ^flagname                          ^flagvalstr        ^flagvalueraw                  ^argvalstr          ^argvalraw
                   ) {};

             print(input);

             function cl_next (text, flagname, flagvaluestr, flagvalueraw, argvaluestr, argvalueraw)
             {
                 if (flagname)
                 {
                     var f = ((flagvaluestr ? flagvaluestr: void 0) || flagvalueraw);

                     if (f)
                     {
                         cmd.flags[flagname] = f.replace(/\\(.)/g, "$1");
                     }
                     else
                     {
                         cmd.flags[flagname] = true;
                     }
                 }
                 else
                 {
                     cmd.args.push(((argvaluestr !== undefined ? argvaluestr: void 0) || argvalueraw).replace(/\\(.)/g, "$1"));
                 }
                 return "";
             }

             return cmd;

	 }
     },

     loadModule: function ()
     {
	 this.commandParsers.optargs = this.parseCommand;
     },

     /** Parses a command.
      * @param {String} text The text to parse.
      * @return {parsedCommand} The parsed command.
      * */



     parseCommand: function (text)
     {
         var cmd = new Object;

         var match = text.match(/^(?:!|\/)([^\s]*)(?:\s+(.*))?/i);

         cmd.args = [];
         cmd.flags = {};

         if (!match) return cmd;

         cmd.name = match[1];
         cmd.input = match[2];

         var input = cmd.input;

         if (!input) return cmd;

         while (input != (input =
			  input.replace(/^\s*(?:\-{1,2}((?:[^\s=]|\\ )+)(?:\=(?:\"((?:\\.|[^\"])+)\"|((?:[^\s"]|\\ )+)))?)|(?:(?:\"((?:\\.|[^\"])+)\")|((?:[^\s"]|\\ )+))/, cl_next))
		//                           ^flagname                  ^flagvalstr        ^flagvalueraw                  ^argvalstr          ^argvalraw
               );

             function cl_next (text, flagname, flagvaluestr, flagvalueraw, argvaluestr, argvalueraw)
         {
             if (flagname)
             {
                 var f = ((flagvaluestr ? flagvaluestr: void 0) || flagvalueraw);

                 if (f)
                 {
                     cmd.flags[flagname] = f.replace(/\\(.)/g, "$1");
                 }
                 else
                 {
                     cmd.flags[flagname] = true;
                 }
             }
             else
             {
                 cmd.args.push(((argvaluestr !== undefined ? argvaluestr: void 0) || argvalueraw).replace(/\\(.)/g, "$1"));
             }
             return "";
         }

         return cmd;

     }

 });
