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
(function () {
     return (
         {
             require: ["com", "parsecommand", "profile", "logs", "util"],


             loadModule: function ()
             {
                 this.logs.logMessage(this.logs.DEBUG);

                 print(sys.backtrace());

                 this.registerTest = this.util.generateRegistor(this, this.util.UNARY_REGISTOR, "testers", false);
             },

             xxtest: function q ()
             {
                 print("xx " + this.xxtest.caller());
                 print(arguments.caller);
             },

             unloadModule: function ()
             {
                 this.registerTest = null;

                 this.testers = null;
             }
         });
 }
)();
