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
         var that = this;

         function bar (val, max, colorfull, colorempty)
         {
             var hpBar = "";
             var d;

             var hpFract = Math.floor(val/max*8*10);
             if (hpFract < 0) hpFract = 0;
             var hpTenths = (hpFract - hpFract%8)/8;
             var hpEightiths = (hpFract-hpTenths*8) % 8;

             for (var x = 0; x < hpTenths; x++) hpBar += "\u2588";
             var hpSlivers = ["", "\u258f", "\u258e", "\u258d", "\u258c", "\u258b", "\u258a", "\u2589"];

             //if ("" + hpSlivers[hpEightiths] == "undefined") print( "UNDEFINED " + [val, max, hpSlivers, hpEightiths, hpFract, hpTenths, hpTenths*8, hpFract - hpTenths].join(", "));

             if (hpEightiths >= 4) hpBar += "\u2588";
             //else hpBar += hpSlivers[hpEightiths];
             while(hpBar.length < 10) hpBar += "\u259e";

             return "<code>[<span style='color:" + that.color.colorTriadToString(that.color.neonify(that.color.colorMixProp(colorfull, colorempty, val/max)))+ "'>" + hpBar + "</span>]</code> ("+String(val/max*100).substring(0, 5)+"%)";
         }

         return "<table><tr><td></td><td>" + e.name + "</td></tr>" +
             "<tr><td><b>HP</b></td><td>" + bar(e.hp, e.maxhp, [0, 0xee, 0], [0xff, 00, 00]) + "</td></tr>"+
             "<tr><td><b>SP</b></td><td>" + bar(e.sp, e.maxsp,  [0x20, 0xff, 0x20], [0, 00, 00]) +"</td></tr>"+
             "<tr><td><b>MP</b></td><td>" + bar(e.mp, e.maxmp, [0, 0, 0xff], [0, 00, 00]) +"</td></tr>"+
             "<tr><td><b>MSP</b></td><td>" + bar(e.msp, e.maxmsp,  [0xaa, 0xaa, 0xff], [00, 00, 00]) +"</td></tr></table>";

     },

     printOutStatus: function (pids, entities)
     {
         var player_htmls = [];
         var mob_htmls= [];
         for (x in entities)
         {
             (entities[x].type == "player" ? player_htmls : mob_htmls).push(this.entHtml(entities[x]));
         }

         var outhtml = "<p align='center'><table><tr><td><h1>Players</h1></td><td><h1>&nbsp;&nbsp;&nbsp;&nbsp;V.S.&nbsp;&nbsp;&nbsp;&nbsp;</h1></td><td><h1>Mobs</h1></td></tr>";

         for (var i = 0; i < player_htmls.length || i < mob_htmls.length; i++)
         {
             outhtml += "<tr><td>" + (player_htmls[i]||"-") + "</td><td></td><td>" + (mob_htmls[i]||"-") + "</td></tr>";
         }

         outhtml += "</table></p>";



         this.com.message(pids, outhtml, -1, true);

     },

     battleStep: function (ctx)
     {
         var x, x2, x3, i;
         var rpg = ctx.rpg;

         var battle = ctx.battle;

         // team_players is an array of all the players that are playing
         // we make it from battle.players
         var team_players = [];
         for (x in battle.players)
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
             entities.push(team_players[x]);
         }

         for (x in team_mobs)
         {
             entities.push(team_mobs[x]);
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
             this.entityTick(entities[x]);

         }

         this.printOutStatus(pids, entities);

         battleLoop: for (x in entities)
         {
             var attacker = ctx.attacker = entities[x];
             var at = entities[x].type;
             var move = ctx.move = this.pickMove(entities[x]);


             if (ctx.move.cost) for (x2 in ctx.move.cost)
             {
                 ctx.attacker[mp] -= ctx.move.cost[x2];

                 if (ctx.attacker[x2] < 0)
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
                 var count = cmp.count || 1;
                 var t = this.util.arrayify(cmp.target);

                 for (x3 in t) switch(t[x3])
                 {
                 case "ally":
                     if (at === "player")
                         targets = ctx.targets = ctx.targets.concat(team_players);
                     else
                         targets = ctx.targets = ctx.targets.concat(team_mobs);
                     break;
                 case "opp":
                     if (at !== "player")
                         targets = ctx.targets = ctx.targets.concat(team_players);
                     else
                         targets = ctx.targets = ctx.targets.concat(team_mobs);
                     break;
                 case "self":
                     ctx.targets.push(ctx.attacker);
                     break;
                 }

                 this.util.shuffle(targets);

                 if (count == -1) count = targets.length;;

                 if (count > 0)
                 {
                     for (x3 in targets)
                     {
                         if (count-- === 0) break;


                         // ["\u2588","\u2593", "\u2592","\u2591"];
                         //print('a');
                         var dmg = this.moves[cmp.move]({attacker: entities[x], target:targets[x3], component:cmp});

                         this.com.message(pids, cmp.desc.replace(/%s/g, ctx.attacker.name).replace(/%t/,targets[x3].name) + " (-"+dmg+")", this.theme.RPG);
                         //print('b');


                     }
                 }

                 var tn = []; // Target names

                 for (x3 in targets) tn.push(targets[x3].name);






             }


         }

         for (i = 0; i < entities.length; i++)
         {
             if (entities[i].hp <= 0)
             {
                 this.com.message(pids, entities[i].name + " was slain!");
                 if (entities[i].type == "player")
                 {
                     battle.players.splice(battle.players.indexOf(entities[i].name), 1);
                 }

                 else
                 {
                     battle.mobs.splice(battle.mobs.indexOf(entities[i]));
                 }

                 entities.splice(i, 1);


                 i--;
             }

         }

         this.com.message(pids, "Battle: End Round.");



         this.printOutStatus(pids, entities);

          if (battle.players.length == 0 || battle.mobs.length == 0)
         {
             this.com.message(pids, "Battle ended");
             delete rpg.battles[ctx.battleId];
         }
     }

 });
