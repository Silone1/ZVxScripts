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

/** @fileOverview The, bootloader
 *
 *
 */
(function () {

     sys.enableStrict();

     var start = +new Date;

     print("ZScriptInitializer Starting.");

     var conf;

     try
     {
         conf = sys.read("zscriptinit.json");
     }
     catch (x)
     {
         conf = null;
     }
     var timer = null;

     timer = sys.setTimer(loadMain, 5000, false);

     print("Automatically starting modloader with default configuration in 5 seconds, or enter another option. Type help for assitance.");

     function loadMain()
     {
         var modloader = sys.exec("js_modules/modloader.js");

         for (var x in scriptobject) delete scriptobject[x];

         for (x in modloader) scriptobject[x] = modloader[x];

         scriptobject.init();

         scriptobject.addSource({type: "web", path: "https://raw.github.com/ArchZombie/zscripts/master/js_modules/"});

         try
         {
             scriptobject.loadModule("default");
         }
         catch (e)
         {
             print(e);
         }

         return;


     }

     var scriptobject = new Object;

     scriptobject.beforeServerMessage = function (message)
     {
         if (timer)
         {
             sys.unsetTimer(timer);
             timer = null;
         }

         if (message.toLowerCase() === "start")
         {
             loadMain();
             return;
         }

         if (message.toLowerCase() === "help")
         {
             print("Type start, atm this is the only option :P");
         }

     };

     return scriptobject;
 })();
