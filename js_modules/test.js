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
({
     require: ["color", "com", "theme"],

     runTests: function (src)
     {
         var red = [0xff, 00, 00];

         var green = [0, 0xff, 0];

         this.com.message(src, "Mixing test...");

         for (var i = 0; i <= 1; i += 1/21)
         {
             var c = this.color.colorMixProp(red, green, i);
             var cd = this.color.colorTriadToString(c);
             this.com.message(src, "<font color="+cd+">Mix " + JSON.stringify(red) + " and " + JSON.stringify(green) + " @ p = " + i + " for " + JSON.stringify(c) + "</font>", this.theme.INFO, true);
         }

         this.com.message(src, "Neonify test...");

         for (var i = 0; i <= 1; i += 1/20)
         {
             var c = this.color.colorMixProp(red, green, i);
             var c2 = this.color.neonify(c, 1);
             var cd = this.color.colorTriadToString(c2);
             this.com.message(src, "<font color="+cd+">Neonify " + JSON.stringify(c) + " for " + JSON.stringify(c2) + "</font>", this.theme.INFO, true);
         }

     }

 });
