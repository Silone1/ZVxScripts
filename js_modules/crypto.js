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
     Locker: function (password, object)
     {
         var sha = sys.sha1;

         var salt = Math.random();
         var cryptpass =sha(  salt.toString() + password );

         password = null;

         return (
             function (passwd)
             {
                 if (sha(salt.toString() + passwd) == cryptpass) return object;

                 else return null;
             }
         );
     },

     HardCrypt: function (key, string)
     {
         var sha = sys.sha1;

         var salt = Math.random() + ":" + +new Date;
         var cryptoproc = sha(salt.toString() + key);

         var chrc = string.split("");
         string = null;

         var cryptoxormask = [];

         for (var x in chrc)
         {
             if (x >= cryptoxormask.length) cryptoxormask = cryptoxormask.concat((cryptoproc = sha((salt+x).toString() + cryptoproc) + sha(cryptoproc + ":")).split());

             chrc[x] = String.fromCharCode(chrc[x].charCodeAt(0) ^ cryptoxormask[x].charCodeAt(0));

             cryptoxormask[x] = 0;
         }

         return [salt, chrc.join("")];

     },

     HardCryptReverse: function (key, crypt)
     {
         var sha = sys.sha1;

         var salt = crypt[0];

         var chrc = crypt[1].split("");

         var cryptoproc = sha(salt.toString() + key);



         var cryptoxormask = [];

         for (var x in chrc)
         {
             if (x >= cryptoxormask.length) cryptoxormask = cryptoxormask.concat((cryptoproc = sha((salt+x).toString() + cryptoproc) + sha(cryptoproc + ":")).split());

             chrc[x] = chrc[x].charCodeAt(0) ^ cryptoxormask[x].charCodeAt(0);

             cryptoxormask[x] = 0;
         }

         for ( x in chrc)
         {
             chrc[x] = String.fromCharCode(chrc[x]);
         }

         return chrc.join("");
     }

 });
