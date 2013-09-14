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
     require: ["commands", "io", "util", "com", "theme"]
     ,
     database: null
     ,
     loadModule: function ()
     {
     var database = this.io.openDB("tours");
     this.tours = database.chans;
     }
     ,
     unloadModule: function ()
     {
     this.io.closeDB("tours");
     }
     ,
     newtour:
     {
     perm: function (src)
     {
         return sys.auth(src) >= 1;
     }
     ,
     code: function (src, cmd, chan)
     {
         if (this.tours[sys.channel(chan).toLowerCase()])
         {
         this.com.message([src], "Channel already has a running tournament.", this.theme.WARN);
         return;
         }
         
         var tr = this.tours[sys.channel(chan).toLowerCase()] = new Object;

         this.com.broadcast(sys.name(src) + " has started a new tournament in #" + sys.channel(chan));

         tr.type = "single";

         tr.players = [];

         return;
        
     }
     }
     ,
     jointour: 
     {
     perm: function ()
     {
         return true;
     }
     ,
     code: function (src, cmd, chan)
     {
         var tr = this.tours[sys.channel(chan).toLowerCase()];
         
         if (!tr)
         {
         this.com.message(src, "No")
         
         }
     }
     }
     ,
     afterBattleEnded:
});