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
/** Module that provides sys-like functions but also works with e.g., ~~Server~~ and etc.<br/>
 * @desc This module also proviedes functions to manage user settings, usergroups, etc.
 * @name user
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.user */
({
     require: ["io", "util"],
     /* Object that stores a reference to database.invisible
      * @type Object
      */

     invisibleUsers: null,

     users: function ()
     {
         var a = [];

         sys.playerIds().forEach(
             function(i)
             {
                 if (sys.loggedIn(i)) a.push(i);
             }
         );

         return a;
     },


     loadModule: function ()
     {
         var db = this.io.openDB("user");
         db.invisble = db.invisible || new Object;
         db.usergroups = db.usergroups || new Object;

         this.database = db;

	 if (!this.database.userconf) this.database.userconf = new Object;



         this.io.registerConfig(this, { segroups0: ["LISTSEC"], segroups1: ["KICKOP", "LOGS", "LOGS[CHAT]", "LOGS[INFO]", "CHATOP", "INFOSEC", "PROTECTED"],
                                        segroups2: ["BANOP", "AUTHOP"], segroups3: ["LOGS[*]", "SILENT", "INVISIBLE", "OVERRIDE"]});

	 this.registerConfigHook = this.util.generateRegistor(this, this.util.LIST_REGISTOR, "configHooks");

     },


     /**
      * @param {String} name
      * @returns {Number} Auth level.
      */
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

     userConfig: function (user)
     {
         var name = this.name(user);

         var lname = name.toLowerCase();

	 var config;

	 if (!( config = this.database.userconf[lname]) )
	 {
             config = this.database.userconf[lname] = new Object;


	 }

         for (var x in this.configHooks)
	 {
	     this.configHooks[x](config, name );
	 }


         return config;

     },

     updateCache: function (lname)
     {
         /*
          The updateCache function updates the internal relational database for the majorgroups of a user.
          */

         // The username should be lowercase, as the database is case insensitive.

         lname = lname.toLowerCase();


         // Purge the old cache
         this.cache[lname] = new Object;

         var cache = this.cache[lname].majorgroups = new Object;

         /*cache*/ var this_database_majorgroups = this.database.majorgroups;


         // go over the old majorgroups to rebuild
         for (var x in this_database_majorgroups)
         {
             var item = this_database_majorgroups[x];


             if (item.members.indexOf(lname) != -1) // User is in the group
             {
                 cache[x] = null; // assign key
             }
         }
     },

     majorGroups: function(src)
     {
         if (src == 0)
         {
             return {"Sever":null};
         }

         var a = this.auth(src);

         var majors = {};

         var name = this.name(src);
         var lname = name.toLowerCase();

         if (sys.dbRegistered(this.name(src)))
         {
             var groups = new Object;

             if (! this.cache[lname] )
             {
                 this.updateCache(lname);
             }

             if (ugroups.length) for (var x in ugroups)
             {
                 groups[ugroups[x]] = null;
             }


             if (   (!("User" in groups))  &&  (!("Moderator" in groups))  &&  (!("Administrator" in groups))  &&  (!("Owner" in groups))   )
             {
                 groups[["User", "Moderator", "Administrator", "Owner"][this.auth(src)]] = null;
             }


             return groups;
         }

         else return {User:null};
     },

     groups: function (src)
     {
         if (src == 0) return {"SERVEROP": null};

         else return this.nameGroups(this.name(src));
     },

     hasPerm: function (id, perm)
     {
         if (id == 0) return true;

         var g = this.groups(id);

         if ("SERVEROP" in g) return true;

         return (perm in ID);
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