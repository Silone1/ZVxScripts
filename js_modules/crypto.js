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
     intToBin: function (i)
     {
         var bin = new sys.ByteArray(4);

         bin[0] = i & 255;
         bin[1] = (i >> 8) & 255;
         bin[2] = (i >> 16) & 255;
         bin[3] = (i >> 24) & 255;

         return bin;
     },

     binToInt: function (bin)
     {
         return bin[0] | (bin[1] << 8) | (bin[2] << 16) | (bin[3] << 24);
     },

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

     HardCrypt: function (key, data)
     {
         // Combination of a stream and block cipher
         var output, hash, salt, crypto, cipher, passes, temp;

         if (typeof data == string) data = sys.ByteArray(data);

         hash = sys.sha1Binary(data);

         output = sys.ByteArray();

         salt = this.intToBin((Math.random() * +new Date) & ((1 << 32) - 1));

         output.append(salt);

         crypto = sys.qCompress( this.intToBin(data.length).append(data).append(sys.sha1Binary(data)) );

         temp = sys.ByteArray(4);

         temp[0] =   93;
         temp[1] =   23;
         temp[2] = 0xff;
         temp[3] =    0;

         cipher = sys.sha1Binary( sys.ByteArray(salt).append(sys.ByteArray(key)) ).append( sys.sha1Binary( temp.append(salt).append(sys.ByteArray(key)) ));

         output.append(crypto.length);

         while (crypto.legnth % 64 != 0)
         {
             temp = sys.ByteArray(1);
             temp[0] = Math.ceil(Math.random()*255);
             crypto.append(temp);
         }


         for (i = 0; i < crypto.length; i += 64)
         {

         }

         function step1()
         {

         }

         function step2()
         {

         }

         function step3()
         {

         }
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
