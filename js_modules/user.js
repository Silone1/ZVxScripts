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
/** Module that provides sys-like functions but also works with e.g., ~~Server~~ and etc.
 * @name user
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.user */
({
     require: ["io"],
     
     invisibleUsers: null,

     loadModule: function ()
     {
         var db = this.io.openDB("user");
         db.invisble = db.invisible || new Object;

         this.invisibleUsers = db.invisible;
     },

     name: function (id)
     {
         if (id == 0 && (typeof id === "number" || typeof id === "string") ) return "~~Server~~";
         else return sys.name(id);
     },


     nameToProper: function (name)
     {
         if (sys.id(name)) return this.name(sys.id(name));

         return name;
     },

     auth: function (id)
     {
         if (id == 0) return 3;

         var a = sys.auth(id);

         return a;
     },

     changeInvisible: function (id, bool)
     {
         if (!id) return;

         var lname = this.name(id).toLowerCase();
         if (lname in this.invisibleUsers && !bool)
         {
             sys.changeAuth(id, this.invisibleUsers[lname]);
             delete this.invisibleUsers[lname];
         }

         if (bool && !(lname in this.invisibleUsers))
         {
             this.invisibleUsers[lname] = this.auth(id);
             sys.changeAuth(id, 0);
         }
     }
 });