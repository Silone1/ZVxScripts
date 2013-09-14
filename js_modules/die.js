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

     require: ["commands", "com", "theme", "user"],


     WAYSOFDYING: [
         "% found an anvil from above.", "% got hit by a meteor.", "Salamence thought % was tasty.",
         "% looked a bit too much like fish food to Sharpedo.",
         "% went dancing with Blaziken.", "% listened to Lapras sing.", "% was tackled by Magikarp!"
     ],


     loadModule: function ()
     {
         this.commands.registerCommand("die", this);
     },


     die:
     {
         server: true,

         desc: "Leave the server with style.",

         perm: function ()
         {
             return true;
         },

         code: function (src, cmd, chan)
         {
             var i = Math.floor(Math.random() * this.WAYSOFDYING.length);

             this.com.broadcast(this.WAYSOFDYING[i].replace(/%/g, this.user.name(src)), this.theme.GAME);

             if (src) sys.kick(src);
         }

     }

});
