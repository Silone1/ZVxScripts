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
         db.usergroups = db.usergroups || new Object;

         this.database = db;

         this.invisibleUsers = db.invisible;

         this.io.registerConfig(this, { segroups0: ["LISTSEC"], segroups1: ["CHATOP", "INFOSEC", "PROTECTED"],
                                        segroups2: ["BANOP", "AUTHOP"], segroups3: ["LOGS", "SILENT", "INVISIBLE", "OVERRIDE"]});
     },

     nameAuth: function (name)
     {
         return (sys.id(name) ? this.auth(sys.id(name)) : sys.dbAuth(name));
     },

     unloadModule: function ()
     {
         this.io.closeDB("user");
     },

     name: function (id)
     {
         if (id == 0 && (typeof id === "number" || typeof id === "string") ) return "~~Server~~";
         else return sys.name(id);
     },

     groups: function (src)
     {
         if (src == 0) return {"SERVEROP": null};

         else return this.nameGroups(this.name(src));
     },

     nameGroups: function (name)
     {
         name = name.toLowerCase();


         if (name == "~~server~~") return {"SERVEROP": null};

         else
         {
             var x;
             var groups = {};

             var auth = +this.nameAuth(name);

             switch (+auth)
             {
             case 3:
                 for ( x in this.config.segroups3 ) groups[this.config.segroups3[x]] = null;
             case 2:
                 for ( x in this.config.segroups2 ) groups[this.config.segroups2[x]] = null;
             case 1:
                 for ( x in this.config.segroups1 ) groups[this.config.segroups1[x]] = null;
             default:
                 for ( x in this.config.segroups0 ) groups[this.config.segroups0[x]] = null;
             }

             if (sys.dbRegistered(name))
             {
                 if (!this.database.usergroups[name]) this.database.usergroups[name] = [];

                 for (x in this.database.usergroups[name]) groups[this.database.usergroups[name][x]] = null;
             }

             return groups;

         }
     },

     nameToProper: function (name)
     {
         if (name.match(/~~Server~~/i)) return "~~Server~~";

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