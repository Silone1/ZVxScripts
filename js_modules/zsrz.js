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
     stringify: function (variant)
     {

         var strings = [];


         function write_back (variant, key)
         {
             if (typeof variant == "object")
             {
                 if (variant === null)
                 {
                     strings.push(JSON.stringify(["value", key, null]));
                     return;
                 }

                 if (! (variant instanceof Array)) strings.push("object\r" + JSON.stringify(key));

                 else strings.push("array\r" + JSON.stringify(key) + "\r" + variant.length);

                 //var keys = Object.keys(variant);//.sort();

                 //if (ordered) keys.sort();

                 for (var x in variant)
                 {
                     write_back(variant[x], x);
                 }

                 strings.push("end");

                 return;
             }

             else if (typeof variant == "number") strings.push("value\r" + JSON.stringify(key) + "\r" + variant.toString());

             else if (typeof variant == "string") strings.push("value\r" + JSON.stringify(key) + "\r" + JSON.stringify(variant));
         }

         write_back(variant);

         return strings.join("\n");

     },

     parse: function (text)
     {
         var lines = text.split(/\n/g);

         var variant = null;

         var nest = [];
         var xv;

         for (var x in lines)
         {
             var i = lines[x];

             var o = i.split(/\r/g);

             if (o[1] && o[1][0] == "u") o[1] = undefined;
             else if (o[1]) o[1] = JSON.parse(o[1]);



             if (o[0] == "object")
             {
                 xv = new Object;
                 if (o[1] != null) nest.push(variant);

                 if (o[1] != null) variant[o[1]] = xv;

                 variant = xv;


             }
             else if (o[0] == "end")
             {
                 if (nest.length) variant = nest.pop();
             }
             else if (o[0] == "value")
             {

                 if (o[1] != null) variant[o[1]] = o[2];
                 else variant = o[2];
             }
             else if (o[0] == "array")
             {
                 xv = new Array(+o[2]);

                 if (o[1] !== null) nest.push(variant);

                 if (o[1] != null) variant[o[1]] = xv;

                 variant = xv;

             }

         }

         return variant;

     }
 });