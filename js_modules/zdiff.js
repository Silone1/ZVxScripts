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
     diff: function (text1, text2)
     {
         if (text1 == text2) return [];

         var diffs = [];

         var hashtab = {};




         var l1 = text1.split(/\n/g); // line old
         var l2 = text2.split(/\n/g); // line new CONST

         for (var i = 0; i < l2.length; i++)
         {
             if (l2[x] == l1[x]) continue;



             for (var i2 = i; i2 < i+50; i2++)
             {
                 if (l1[i2] == l2[i])
                 {
                     diffs.push(["-", i, i2 - i]); // subtract
                     l1.splice(i, i2 - i);
                     continue;
                 }
             }

             var df = ["+", i];
             for (var o = i; l1[o] != l2[i] && i < l2.length; i++)
             {
                 df.push(l2[i]);
                 l1[x].splice(i, 0, l2[i]);
             }

             l1[x].splice(i, 0, l2[i]);
         }

         return [];
     }
});