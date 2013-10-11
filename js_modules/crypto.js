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
         var cryptpass = sha(  salt.toString() + password );

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
         var output, hash, salt, crypto, cipher, passes, temp, ciphers, i, subcipher, i2, unencrypted_output, compressed_output, num_blocks;

         if (typeof data == "string") data = sys.ByteArray(data);
         if (typeof key == "string") key = sys.ByteArray(key);

         salt = sys.ByteArray(8);

         for (i = 0; i < 8; i++)
         {
             salt[i] = Math.floor(Math.random() * 256);
         }

         cipher = this.sha1x128(sys.ByteArray(0).append(salt).append(key));

         output = sys.ByteArray(0).append(salt);

         unencrypted_output = sys.ByteArray(8);


         // Add garbage to make the data more secure
         for (i = 0; i < 8; i++)
         {
             unencrypted_output[i] = Math.floor(Math.random() * 256);
         }

         unecrypted_output.append(data.length); // Append data's length

         unencrypted_output.append(data); // Add the data

         unencrypted_output.append(sys.sha1Binary(unencrypted_output)); // Add hash to prevent tampering.

         i2 = Math.floor(Math.random()*200); // Arbitrary amount of garbage

         temp = sys.ByteArray(i2);

         // Add garbage to make the data more secure
         for (i = 0; i < i2; i++)
         {
             temp[i] = Math.floor(Math.random() * 256);
         }

         unencrypted_output.append(temp);

         // final unecrypted_output

         compressed_output = sys.qCompress(unencrypted_output);

         // now add garbage so that compressed output is of block size:

         while(compressed_output.length % 64 != 0)
         {
             temp = sys.ByteArray(1);
             temp[0] = Math.floor(Math.random() * 256);
             compressed_output.append(temp);
         }

         num_blocks = compressed_output.length / 64;

         ciphers = [];

         for (i = 0; i < num_blocks; i++)
         {
             ciphers[i] = this.applyCipher(cipher, (i == 0? cipher: ciphers[i - 1]));
         }

     },


     sha1x128: function (data)
     {
         var output, i;
         output = sys.ByteArray(0);

         for (i = 0; i < 7; i++)
         {
             output.append( sys.sha1Binary( data.append(this.intToBin(i)) ));
         }

         output.truncate(128);

         return output;
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
