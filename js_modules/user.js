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

         this.script.registerHandler("beforeLogIn", this);
         var db = this.io.openDB("user");
         db.invisble = db.invisible || new Object;
         db.usergroups = db.usergroups || new Object;

         this.database = db;

         this.database.majorgroupinfo = this.database.majorgroupinfo || new Object;
         this.relMajors = new Object;

	 if (!this.database.userconf) this.database.userconf = new Object;

         this.cache = new Object;

         //this.io.registerConfig(this, { segroups0: ["LISTSEC"], segroups1: ["KICKOP", "LOGS", "LOGS[CHAT]", "LOGS[INFO]", "CHATOP", "INFOSEC", "PROTECTED"],
         //                              segroups2: ["BANOP", "AUTHOP"], segroups3: ["LOGS[*]", "SILENT", "INVISIBLE", "OVERRIDE"]});

	 this.registerConfigHook = this.util.generateRegistor(this, this.util.LIST_REGISTOR, "configHooks");

         var t = this;
         function declMajor (name, perms, inherit)
         {
             var test = !t.majorGroupExists(name);
             if (test)
             {
                 t.createMajorGroup(name);
                 t.majorGroupAddPerms(name, perms);
                 t.majorGroupInheritsAdd(name, inherit);
             }
         }

         if (Object.keys(this.database.majorgroupinfo).length == 0)
             // config deleted/new server, add defaults that are not "required"
         {
             declMajor("ServerOperator", ["SERVEROP"], "User");

             declMajor("Scripter", ["LOGS[SCRIPTERROR]"], "User");
             declMajor("VIP", ["PROTECTED"], "User");
         }


         declMajor("User", ["CHAT"]);
         declMajor("Registered", ["LIST[BANS]", "LIST[MUTES]", "INFO[GROUPS]", "INFO[AUTH]"], "User");
         declMajor("Moderator", ["KICK", "LOGS[CHAT]", "LOGS[INFO]", "MUTE", "INFO[IP]", "PROTECTED"], "Registered");
         declMajor("Administrator", ["BAN", "AUTH[0]", "AUTH[1]"], "Moderator");
         declMajor("Owner", ["LOGS[*]", "AUTH[*]", "SILENT", "INVISIBLE", "OVERRIDE", "INFO[*]", "CONFIGURE[MOTD.MESSAGE]", "CONFIGURE[ANNOUNCEMENT.TEXT]"],  "Administrator");


         this.updateRelationalDB();



     },

     updateRelationalDB: function ()
     {
         var x, x2;

         this.relMajors = new Object;

         for (x in this.database.majorgroupinfo)
         {
             var group = this.database.majorgroupinfo[x];


             for (x2 in group.members)
             {
                 this.relMajors[group.members[x2]] = this.relMajors[group.members[x2]] || [];

                 this.relMajors[group.members[x2]].push(group.name);
             }
         }
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

     clearCache: function ()
     {
         this.cache = new Object;
     },


     majorGroups: function (src)
     {
         return this.nameMajorGroups(this.name(src));
     },

     majorGroupExists: function (name, perms)
     {
         return name in this.database.majorgroupinfo;
     },

     majorGroupAddPerms: function (name, perms)
     {
         perms = this.util.arrayify(perms);

         var group = this.database.majorgroupinfo[name];

         for (var x in perms)
         {
             if (group.perms.indexOf(perms[x]) === -1)
             {
                 group.perms.push(perms[x]);
             }
         }

         this.clearCache();

     },

     majorGroupDropPerms: function (name, perms)
     {
         var group, x, index;
         perms = this.util.arrayify(perms);

         group = this.database.majorgroupinfo[name];

         for ( x in perms)
         {
             index = group.perms.indexOf(perms[x]);

             if (index !== -1)
             {
                 group.perms.splice(index, 1);
             }
         }

         this.clearCache();

     },

     majorGroupInheritsAdd: function (name, groups)
     {
         var group = this.database.majorgroupinfo[name];

         if (!group.inherits) group.inherits = [];

         group.inherits = this.util.concatSets(group.inherits, this.util.arrayify(groups));

         this.clearCache();

         return;
     },

      majorGroupInheritsSet: function (name, groups)
     {
         var group = this.database.majorgroupinfo[name];

         if (!group.inherits) group.inherits = [];

         group.inherits = this.util.concatSets(this.util.arrayify(groups));

         this.clearCache();

         return;
     },

     createMajorGroup: function (name)
     {
         this.database.majorgroupinfo[name] =
             {
                 name: name,
                 desc: "",
                 perms: [],
                 members: [],
                 inherits: []
             };

         this.clearCache();

         return;
     },

     deleteMajorGroup: function (name)
     {
         var g = this.database.majorgroupinfo[name];

         for (var x in g.members)
         {
             var username = g.members[x];

             if (!this.relMajors[username]) continue;

             var index = this.relMajors[username].indexOf(name);
             this.relMajors[username].splice(index, 1);

         }

         delete this.database.majorgroupinfo[name];
         this.clearCache();
         return;
     },

     majorGroupDropMember: function (groupname, user)
     {
         return this.majorGroupDropMemberName(groupname, this.name(user));
     },

     majorGroupAddMember: function (groupname, user)
     {
         return this.majorGroupAddMemberName(groupname, this.name(user));
     },

     majorGroupAddMemberName: function (groupname, username)
     {
         username = username.toLowerCase();

         if (this.database.majorgroupinfo[groupname].members.indexOf(username) !== -1) return false;

         this.clearCache();

         this.database.majorgroupinfo[groupname].members.push(username);

         this.relMajors[username] = this.relMajors[username] || [];
         this.relMajors[username].push(groupname);

         return true;
     },



     majorGroupDropMemberName: function (groupname, username)
     {
         var index;

         username = username.toLowerCase();

         index = this.database.majorgroupinfo[groupname].members.indexOf(username);

         if (index === -1) return false;

         this.clearCache();

         this.database.majorgroupinfo[groupname].members.splice(index, 1);

         this.relMajors[username] = this.relMajors[username] || [];

         index = this.relMajors[username].indexOf(groupname);
         this.relMajors[username].splice(index, 1);


         return true;
     },


     nameMajorGroups: function(name)
     {
         var ugroups, groups, majors;
         var lname = name.toLowerCase();

         if (lname == "~~server~~")
         {
             return {"Sever":null};
         }

         if (sys.dbRegistered(lname))
         {
             groups = {"Registered": null};
         }
         else return {"User": null};

         if (!this.relMajors[lname]) ugroups = [];
         else ugroups = this.relMajors[lname];

         if (ugroups) for (var x in ugroups)
         {
             groups[ugroups[x]] = null;

         }

         if ((!("User" in groups))  &&  (!("Moderator" in groups))  &&  (!("Administrator" in groups))  &&  (!("Owner" in groups)))
         {
             groups.User = null;
         }


         return groups;
     },


     beforeLogIn: function (src)
     {
         var groups = this.majorGroups(src);

         if ( src != 0 &&  ((!("User" in groups))  &&  (!("Moderator" in groups))  &&  (!("Administrator" in groups))  &&  (!("Owner" in groups)) || this.auth(src) != 0 ) )
         {
             var a = this.auth(src);

             if (a)
             {
                 this.majorGroupAddMember([null, "Moderator", "Administrator", "Owner"][this.auth(src)], src);
             }
         }
     },

     groups: function (src)
     {
         if (src == 0) return {"SERVEROP": null};

         else return this.nameGroups(this.name(src));
     },

     permsOfMajorGroup: function (groupname)
     {
         if (this.cache["$permsMaj$" + groupname]) return this.cache["$permsMaj$" + groupname];
         var groupmod = {};

         var group = this.database.majorgroupinfo[groupname];

         if (! group) return {};

         var perms = group.perms || [];

         for (var x in group.inherits)
         {
             perms = this.util.concatSets(perms, this.permsOfMajorGroup(group.inherits[x]));
         }

         this.cache["$permsMaj$" + groupname] = perms;

         return perms;
     },

     hasPerm: function (id, perm)
     {
         if (id == 0) return true;

         var g = this.groups(id);

         if ("SERVEROP" in g) return true;

         var _;
         return (perm in g) || (_ = perm.match(/^([A-Z])\[([^\]]+)\]$/) && ((_[1]+"[*]") in g));
     },

     nameGroups: function (name)
     {
         var _, majors;
         name = name.toLowerCase();


         if (name == "~~server~~") return {"SERVEROP": null};

         else
         {
             var x;
             var groups = {};

             //  var auth = +this.nameAuth(name);
             /*
              switch (+auth)
              {
              case 3:
              for ( x in this.config.segroups3 )
              {
              groups[this.config.segroups3[x]] = null;
              if ((_ = x.match(/^([A-Z])\[.+\]/))) groups[_[1]] = null;
              }
              case 2:
              for ( x in this.config.segroups2 )
              {
              groups[this.config.segroups2[x]] = null;
              if ((_ = x.match(/^([A-Z])\[.+\]/))) groups[_[1]] = null;
              }
              case 1:
              for ( x in this.config.segroups1 )
              {
              groups[this.config.segroups1[x]] = null;
              if ((_ = x.match(/^([A-Z])\[.+\]/))) groups[_[1]] = null;
              }
              default:
              for ( x in this.config.segroups0 )
              {
              groups[this.config.segroups0[x]] = null;
              if ((_ = x.match(/^([A-Z])\[.+\]/))) groups[_[1]] = null;
              }

              }*/

             if (sys.dbRegistered(name))
             {
                 if (this.database.usergroups[name])
                 {
                     for (x in this.database.usergroups[name]) groups[this.database.usergroups[name][x]] = null;
                 }
             }

             var majorgroups = this.nameMajorGroups(name);

             for (x in majorgroups)
             {
                 var sub = this.permsOfMajorGroup(x);
                 for (var x2 in sub) groups[sub[x2]] = null;
             }



             for (x in groups)
             {
                 majors = x.match(/^([A-Z]*)\[([A-Z\.\*]*)\]$/);
                 if (majors)
                 {
                     groups[majors[1]] = null;
                 }
             }

             if ("SERVEROP" in groups) return {"SERVEROP":null};


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