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

     zdiff: function (text1, text2)
     {
         text1 = text1.split(/\n/g);
         text2 = text2.split(/\n/g);

         var output = [];

         for (var i = 0; i < text1.length)
         {
             if (text1[i] == text2[i]) continue;

             var fwds = false;
             var bwds = false;
             var fwdloc = null;
             var bwdloc = null;

             var ulimit = Math.min(text2.length, text1.length, i + 50);

             l0: for (var x = i; x < ulimit; x++)
             {
                 if (!fwds && text1[i] == text2[x])
                     // If in text1 and text 2, inserted text
                 {
                     fwds = true;

                     if (bwds) break l0;
                 }
                 if (!bwds && text2[i] == text1[x])
                     // deleted text
                 {
                     bwds = true;
                     if (fwds) break l0;
                 }

             }

             if (fwds && bwds)
                 // swaptext
             {


             }

         }

     }
 });