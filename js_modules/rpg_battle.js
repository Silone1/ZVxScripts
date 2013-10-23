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
/** An rpg battle descriptor. Note the format is subject to change.
 * @name rpgBattle
 * @class
 */
/** The players in the battle. Note this is an array of player /names/ not objects. This is done so as not to have duiplicates of player objects in the database.
 * @name players
 * @type {Array.<String>}
 * @memberOf rpgBattle.prototype
 */
/** The mobs in the battle.
 * @name mobs
 * @type {Array.<rpgMob>}
 * @memberOf rpgBattle.prototype
 */
/** @scope script.modules.rpg_game */
({
     /** Battle step will cause a turn in a battle to take place
      * @event
      * @param {rpgCtx} ctx
      * @param {rpgBattle} ctx.battleid The id of the specific battle this should step.
      * @param {rpgClass} ctx.rpg The current rpg we are in.
      */

     entHtml:  function (e)
     {
         var hpBar = "";
         var d;

         var hpFract = (e.hp/e.maxhp*8*10) >> 0;
         var hpTenths = (hpFract - hpFract%8)/8;
         var hpEightiths = (hpFract-hpTenths*8) % 8;

         for (var x = 0; x < hpTenths; x++) hpBar += "\u2588";
         var hpSlivers = ["", "\u258f", "\u258e", "\u258d", "\u258c", "\u258b", "\u258a", "\u2589"];
         hpBar += hpSlivers[hpEightiths];
         while(hpBar.length < 10) hpBar += "\u259e";

         if (hpFract >= 40)

         {
             d = 0xff - (((hpFract - 40)/40*0xff) |0);
             d = d.toString(16);
             if (d.length == 1) d = "0" + d;
             d ="#"+ d + "FF00";
         }
         else
         {
             d = ( ((hpFract)/40)*0xff) |0;
             d = d.toString(16);
             if (d.length == 1) d = "0" + d;
             d ="#FF"+ d + "00";
         }

         return "<b>Name:</b> " + e.name + "<br/>"+
             "<b>HP:</b> <code>[<span style='color:" + d+ "'>" + hpBar + "</span>]</code>";
     },

     battleStep: function (ctx)
     {
         var x, x2, x3;
         var rpg = ctx.rpg;

         var battle = ctx.battle;

         // team_players is an array of all the players that are playing
         // we make it from battle.players
         var team_players = [];
         for (var x in battle.players)
         {
             team_players.push(rpg.players[battle.players[x]]);
             // Battle players contains NAMES of players, not the player objects!
         }

         var team_mobs = []; // Do not save!
         for ( x in battle.mobs)
         {
             team_mobs.push(battle.mobs[x]);
         }

         var entities = []; // Do not save!


         for (x in team_players)
         {
             entities.push({type: "player", e: team_players[x]});
         }

         for (x in team_mobs)
         {
             entities.push({type: "mob", e: team_mobs[x]});
         }

         entities.sort(
             function (a, b)
             {
                 return a.speed - b.speed;
             }
         );

         var pids = [];

         for ( x in battle.players) pids.push(sys.id(battle.players[x]));

         this.com.message(pids, "Battle: Start Round.");

         for (x in entities)
         {
             this.entityTick(entities[x].e);
             //this.com.message(pids, JSON.stringify(entities[x].e));
             this.com.message(pids, this.entHtml(entities[x].e), -1, true);
             //this.com.message(pids, this.entHtml(entities[x].e), -1, false);
         }

         battleLoop: for (x in entities)
         {
             var attacker = ctx.attacker = entities[x].e;
             //ctx.attackerIsPlayer = entities[x].type == "player";
             var move = ctx.move = this.pickMove(entities[x].e);

             if (ctx.move.cost) for (x2 in ctx.move.cost)
             {
                 ctx.attacker[(x2 === "mp"? "mana" : x2)] -= ctx.move.cost[x2];

                 if (ctx.attacker[(x2 === "mp"? "mana" : x2)] < 0)
                 {
                     this.com.message(pids, ctx.attacker.name + " tried to use "  + ctx.move.name + " but didn't have enough " + this.longStatName[x2 === "mp" ? "mana" : x2],
                                      this.theme.GAME);
                     continue battleLoop;
                 }
             }

             for (x2 in ctx.move.components)
             {
                 var cmp = ctx.move.components[x2];
                 var targets = ctx.targets = [];
                 var count = cmp.count;
                 var t = this.util.arrayify(cmp.target);
                 for (x3 in t) switch(t[x3])
                 {
                 case "ally":
                     ctx.targets = ctx.targets.concat(team_players);
                     break;
                 case "opp":
                     ctx.targets = ctx.targets.concat(team_mobs);
                     break;
                 case "self":
                     ctx.targets.push(ctx.attacker);
                     break;
                 }

                 this.util.shuffle(targets);

                 if (count == -1) count = targets.length;;

                 if (count > 0) for (x3 in targets)
                 {
                     if (count-- === 0) break;


                     // ["\u2588","\u2593", "\u2592","\u2591"];

                     var dmg = this.moves[cmp.move]({attacker: entities[x], target:targets[x3], component:cmp});

                     this.com.broadcast(cmp.desc.replace(/%s/g, ctx.attaker.name).replace(/%t/,targets[x].name) + " (-"+dmg+")", this.theme.RPG);



                 }

                 var tn = []; // Target names

                 for (x3 in targets) tn.push(targets[x3].name);






             }
         }

     }

 });
