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
/** Contains the RPG game :)
 * @name rpg_game
 * @memberOf script.modules
 * @requires io, com, theme, commands, util, logs, less
 * @namespace
 * */
/** @scope script.modules.rpg_game */
({
     /** List of modules to be required.
      * @type {string[]}
      */
     require: ["io", "com", "theme", "commands", "util", "logs", "less", "color"],


     /** List of files to be included in this module.
      * @type {string[]}
      */
     include: ["rpg_areas", "rpg_player", "rpg_entity", "rpg_actions",
               "rpg_mobs", "rpg_equips", "rpg_materials", "rpg_moves",
               "rpg_battle"],


     database: null,
     /** channel */
     channels: null
     ,
     hooks: null
     ,
     loadModule: function ()
     {
         this.database = this.io.openDB("rpg_game");
         if (!this.database.games) this.database.games = new Object;
         this.channels = new Object;
         this.hooks = new Object;

         this.commands.registerCommand("loadrpg", this);
         this.commands.registerCommand("rpg", this);

         this.script.registerHandler("step", this);


         this.io.registerConfig(this, {materias: this.materials});
     },

     unloadModule: function ()
     {
         this.io.closeDB("rpg_game");
     },

     step: function ()
     {
         for (var x in this.channels)
         {
             this.RPGStep(this.channels[x]);
         }
     },

     RPGStep: function (rpg)
     {
         if (rpg.paused) return;
         rpg.tick++;

         for (var x in rpg.areas)
         {
             this.areaStep(rpg.areas[x], { rpg: rpg });
         }

         for (x in rpg.players)
         {
             this.playerStep(rpg.players[x], {rpg: rpg});
         }

         if (rpg.tick % 10 == 0) for (x in rpg.battles)
         {
             this.battleStep( {rpg:rpg, battle: rpg.battles[x], battleId: x });
         }
     },

     RPG: function (rpgname)
     {
         if (this.database.games[rpgname]) { return this.database.games[rpgname]; }

         else
         {
             var newr = this.database.games[rpgname] =
                 {
                     name: rpgname,
                     areas: JSON.parse(JSON.stringify(this.areas)),
                     materials: {},
                     players: {},
                     battles: {},
                     battleCoutner: 0,
                     running: false,
                     tick: 0
                 };

	     return newr;
         }

         return newr;
     },

     startRPGinChan: function (rpgname, chan)
     {
         var rpg = this.database.games[rpgname];

         this.channels[chan] = rpg;

         if ( this.hooks[rpgname] ) throw new Error("Already hooked into another channel?");

         this.logs.logMessage(this.logs.INFO, "Loaded RPG game " + rpgname + " in channel " + sys.channel(chan));

         this.hooks[rpgname] =
             {
                 message: this.util.bind
                 (
                     this
                     ,
                     function(player, message)
                     {
                         this.com.message([player], message, this.theme.GAME, true, [chan]);
                     }
                 )
                 ,
                 broadcast: this.util.bind
                 (
                     this
                     ,
                     function (message)
                     {
                         this.com.broadcast(message, this.theme.GAME, true, [chan]);
                     }
                 )
             };


         rpg.running = true;

     },

     /** @type commandDescriptor */
     rpg: // not to be confused with "RPG"
     {
         category: "fun/rpg",
         desc: "Enter an RPG command!",
         perm: function ()
         {
             return true;
         },
         code: function (src, cmd, chan)
         {
             if (!this.channels[chan])
             {
                 this.com.message([src], "No RPG running in that channel", this.theme.WARN);
                 return;
             }

             var rpg = this.channels[chan];

             var player = rpg.players[sys.name(src).toLowerCase()];

             if (! player)
             {
                 this.com.message([src], "Creating you a new RPG character!", this.theme.GAME);
                 this.logs.logMessage(this.logs.INFO, sys.name(src) + " created an RPG character in RPG " + rpg.name);

                 player = this.newPlayer();
                 player.name = sys.name(src).toLowerCase();

                 rpg.players[sys.name(src).toLowerCase()] = player;
             }

             var actions = String(cmd.input).split(/\;/g);

             for (var x in actions)
             {
                 var subactions = actions[x].split(/[,:|]/g);

                 if (subactions.length == 0) continue;

                 subactions[0] = subactions[0].toLowerCase();
                 if (subactions[0] in this.rpgActions)
                 {
                     this.rpgActions[subactions[0]].apply(this, [src, subactions, chan, {player:player, rpg: rpg }] );
                 }
             }
         }
     },

     /** @type commandDescriptor */
     loadrpg:
     {
         desc: "Loads an RPG into a channel.",
         category: "administrative/rpg",
         perm: function (src)
         {
             return sys.auth(src) >= 2;
         }
         ,
         code: function (src, cmd, chan)
         {

             var rpgname = cmd.input.replace(/^\s*([^\s]+)\s*$/, "$1");

             if (this.channels[chan])
             {
                 this.com.message([src], "This channel already has a running RPG", this.theme.WARN);
                 return;
             }

             var rpg = this.RPG(rpgname);
             if (this.hooks[rpgname])
             {
                 this.com.message([src], "RPG is already running!", this.theme.WARN);
                 return;
             }

             this.startRPGinChan(rpgname, chan);
         }
     }

 });
