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
    rpgActions:
    {
        test: function (src, cmd, chan, rpg, subactions)
        {
            this.com.message([src], "test", this.theme.GAME, false, [chan]);
        }
        ,
        walk: function (src, sub, chan, ctx)
        {
            for (var i = 1; i < sub.length; i++)
            {                
                var to = sub[i];

                if (this.areas[ctx.player.area].adjc.indexOf(to) !== -1)
                {

                    this.com.message([src], "Walked from " + this.areas[ctx.player.area].name + " to " + this.areas[to].name + ".", this.theme.GAME);

                    ctx.player.area = to;
                }
                else
                {
                    this.com.message([src], "Can't find that place!", this.theme.GAME);
                }
            }

            this.com.message([src], "You are at: " + this.areas[ctx.player.area].name + ". From here you can go to:", this.theme.GAME, false, [chan]);


            
            for (var i = 0; i < this.areas[ctx.player.area].adjc.length; i++)
            {
                this.com.message([src], this.areas[this.areas[ctx.player.area].adjc[i]].name + " (" + this.areas[ctx.player.area].adjc[i] + ")", -1, false, chan);
            }        

            
        }
        ,
        dig: function (src, sub, chan, ctx)
        {
            ctx.player.activeActions.push({ timer: 40, done: "dig", tick: "digTick" });
        }
        ,
        dequip: function (src, sub, chan, ctx)
        {
            var slot = (sub[1]||"").toLowerCase();
            
            if (! (slot in {"lhand":null, "rhand":null, "head":null, "feet":null, "body":null, "back":null})) 
            {
                this.com.message([src], "Unknown slot to dequip");
                return; 
            }// add error message

            var item = ctx.player[slot];

            if (item === undefined) throw new Error("???");

            if (item === null && slot === "lhand" && ctx.player.rhand && ctx.player.rhand.hands === 2)
            {
                item = ctx.player.rhand;
                slot = "rhand";
            }

            if (item === null) 
            {
                this.com.message(src, "No item in that slot.");
                return; // nothing to dequip
            }

            ctx.player[slot] = null; // remove item

            ctx.player.equips.unshift(item); // Add to equips

            this.com.message([src], "Item removed.");
            
        }
        ,
        view: function (src, sub, chan, ctx)
        {
            var msgs = [];

            this.com.message(src, "Your player:");
            if (ctx.player.rhand && this.equips[ctx.player.rhand.type].hands === 2)
            {
                 msgs.push("<b>Both Hands:</b> " + this.equipName(ctx.player.rhand));
            }
            else
            {
                msgs.push("<b>Right Hand:</b> " + this.equipName(ctx.player.rhand));
                msgs.push("<b>Left Hand:</b> " + this.equipName(ctx.player.lhand));
            }
            msgs.push("<b>Head:</b> " + this.equipName(ctx.player.head));
            msgs.push("<b>Body:</b> " + this.equipName(ctx.player.body));
            msgs.push("<b>Feet:</b> " + this.equipName(ctx.player.feet));
            msgs.push("<b>Back:</b> " + this.equipName(ctx.player.back));
            msgs.push("<b>Power:</b> " + ctx.player.power);
            msgs.push("<b>Offense:</b> " + ctx.player.offense);
            msgs.push("<b>Defense:</b> " + ctx.player.defense);
            msgs.push("<b>Magical:</b> " + 0/0);

            this.less.less(src, msgs.join("<br />"), true);
        }
        ,
        equip: function (src, sub, chan, ctx)
        {
            if (!sub[1])
                // list equips
            {
                for (var x in ctx.player.equips)
                {
                    this.com.message(src, "" + (+x+1) + ": " + this.equipName(ctx.player.equips[x]));
                }
                
                return;
            }

            var idx = +sub[1] - 1;

            var item = ctx.player.equips.splice(idx, 1)[0];
            var kind = this.equips[item.type];

            if (!item) return; // invalid indexing ._.

            var slot = kind.type;

            if (slot === "hand") 
            {
                if (sub[2] === "lhand") slot = "lhand";
                else if (sub[2] === "rhand") slot = "rhand";
                else
                {
                    if (kind.hands !== 2)
                        // error
                    {
                        ctx.player.equips.unshift(item); // put item back
                        this.com.message(src, "Which hand?");
                        return; // exit
                    }

                    slot = "rhand";

                    if (ctx.player.lhand)

                        // remove left hand equip
                    {
                        ctx.player.equips.unshift(ctx.player.lhand);
                        ctx.player.lhand = null;
                    }
                }
            }

            if (ctx.player[slot]) ctx.player.equips.unshift(ctx.player[slot]);// put old item back

            if (slot === "lhand" && ctx.player.rhand && this.equips[ctx.player.rhand.type].hands === 2)
            {
                ctx.player.equips.unshift(ctx.player.rhand);// put old item back
                ctx.player.rhand = null;
            }

            ctx.player[slot] = item;

            this.com.message(src, "Equipped " + this.equipName(item));

            return;
        }
        
    }
    ,
    actions:
    {
        dig:  function (actionObj, ctx)
        {
          //  print(this.util.inspect(ctx.player));
            var src = sys.id(ctx.player.name);
            this.com.message([src], "You dug something up!", this.theme.GAME);

            for (var x in this.areas[ctx.player.area].digs)
            {
                this.com.message([src], "It was an " + x, this.theme.GAME);
            }
        }
        ,
        explore: function (actionObj, ctx)
        {
            for (var x in this.areas[ctx.player.area].mobs)
            {
                this.com.message([src], "You started battle with " + JSON.stringify(this.areas[ctx.player.area].mobs[x]), this.theme.GAME);
            }
        }
        ,
        digTick: function (actionObj, ctx)
        {
            var src = sys.id(ctx.player.name);            
            this.com.message([src], "You are digging a hole.", this.theme.GAME);
        }
    } 
});
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
    areaStep: function () {}
    ,
    areas:
    {
        town1:
        {
            name: "The town",
            adjc: ["town1west", "cliff1"]
        }
        ,
        town1west:
        {
            name: "Town West Side",
            adjc: ["town1"],
            digs: 
            {
                ironore: 0.5                
            }
        }
        ,
        cliff1:
        {
            name: "A cliff",
            adjc: ["town1"],
            mobs: 
            {
                chicken: 1
            }
        }
    }

});
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
    battleStep: function (ctx)
    {
        var x;
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
            function _sorting_function_ (a, b)
            {
                return a.speed - b.speed;
            }
        );

        var pids = [];

        for ( x in battle.players) pids.push(sys.id(battle.players[x]));

        battleLoop: for ( x in entities)
        {
            var attacker = ctx.attacker = entities[x].e;
            //ctx.attackerIsPlayer = entities[x].type == "player";
            var move = ctx.move = this.pickMove(entities[x]);

            if (ctx.move.cost) for (var x2 in ctx.move.cost)
            {
                ctx.attacker[(x2 === "mp"? "mana" : x)] -= ctx.move.cost[x2];
                if (ctx.attacker[(x2 === "mp"? "mana" : x)] < 0)
                {
                    this.com.message(pids, ctx.attacker.name + " tried to use "  + ctx.move.name + " but didn't have enough " + this.longStatName[x2 === "mp" ? "mana" : x2],
                                    this.theme.GAME);
                    continue battleLoop;
                }
            }

            for (var x2 in ctx.move.components)
            {
                var cmp = ctx.move.components[x2];
                var targets = ctx.targets = [];
                var count = cmp.count;
                switch (typeof cmp.target)
                {
                case "object":
                    // Array
                    if (cmp.target.indexOf("ally") != -1) ctx.targets = ctx.targets.concat(team_players);
                    if (cmp.target.indexOf("opp") != -1) ctx.targets = ctx.targets.concat(team_mobs);
                    if (cmp.target.indexOf("self") != -1 && ctx.indexOf(ctx.attacker) == -1) ctx.targets.push(ctx.attacker);
                    break;
                case "string":
                    switch (ctx.move.type)
                    {
                        case "ally": ctx.targets = team_players;
                        case "self": ctx.targets = [attacker];
                    }
                }

                this.util.shuffle(targets);

                if (count > 0) for (var x3 in targets)
                {
                    if (count-- === 0) break;


                    this.moves[cmp.move]({attacker: entities[x], targets:targets, component:cmp});



                }
            }
        }

    }

});
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
    entityTick: function (e)
    {

        e.sta += e.maxsta/300;
        e.msta += e.maxmsta/60;

        // Stamina
        if (e.sp < 0)
            // No stamina
        {
            e.hp += e.sp;
            // Reduce the HP by the amount of missing stamina.

            e.sta = 0;
            // Reset stamina
        }
        if (e.sp > e.maxsp / 3)
            // Has a fairly large amount of stamina
        {
            hp += maxhp/600;
            // Recover some HP
        }
        if (e.sp > e.maxsp)
            // Too much stamina!
        {
            e.sp = e.maxsp;
            // Remove overflow
            
            hp += maxhp/300;
            // recover extra hp!
        }

        // Mental Stamina
        if (e.msta < 0)
            // No mental stamina
        {
            e.mp -= e.msta;
            e.hp -= e.msta;
            // Lose hp and mana

            e.msta = 0;
            // Reset
        }
        if (e.msta > e.maxmsta / 3)
            // Recover mana
        {
            e.mana += e.maxmana/100;
            // increase
        }

        // Mana
        if (e.mana < 0)
            // Not enough mana
        {
            e.sta += e.mana;
            e.msta += e.mana;
            // Decrease staminas

            e.mana = 0;
            // Reset mana;
        }
        if (e.mana > e.maxmana)
            // Too much mana
        {
            if (e.mana > e.maxmana *1.1) e.hp += e.maxmana*1.1 - e.mana;
            // Decrease HP by overflow, uncontrolable mana damages body!
            
            e.mana = e.maxmana;
            // Reset
        }

        // Health
        if (e.hp <= 0 && !e.invincible && (!e.undead && e.hp > -e.maxhp*5))
            // check for death
        {
            this.entityDie(e);
        }
        else if (e.hp > e.maxhp)
            // overflow
        {
            e.hp = e.maxhp;
            // reset
        }
        

        
    }
    
});
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
/** This type of object contains the definitions of equips.
 * @name rpgEquip
 * @class
 */
/** The human readable version of the name of this equip.
 * @name name
 * @memberOf rpgEquip.prototype
 */
/** Either 'head' 'body' 'feet' 'hand' or 'back'.
 * @name type
 * @memberOf rpgEquip.prototype
 */
/** How many hands, for equips of class hand, either 1 or 2.
 * @name hands
 * @memberOf rpgEquip.prototype
 * @type Number
 */
/** An array of all the different types of materials that can be used to make this item.
 * @name materials
 * @memberOf rpgEquip.prototype
 */
/** How much of the material is needed to make the item.
 * @name amount
 * @memberOf rpgEquip.prototype
 */
/** How much protection or damage the item provides.
 * @name base
 * @memberOf rpgEquip.prototype
 */
/** @scope script.modules.rpg_game */
({
    /** Names of equips and the corresponding equip.
     * @type {Object.<rpgEquip>}
     */
    equips:
    {
        shoes:
        {
            name: "Shoes",
            type: "feet",
            amount: 25,
            base: 10,
            materials: ["hide", "scale"]
        }
        ,
        hat:
        {
            name: "Hat",
            type: "head",
            amount: 5,
            base: 20,
            materials: ["cloth", "hide"]
        }
        ,
        helmet:
        {
            name: "Helmet",
            type: "head",
            materials: ["metal", "scale", "bone"],
            amount: 5,
            base: 25
        }
        ,
        cloak:
        {
            name: "Cloak",
            type: "back",
            amount: 30,
            base: 5,
            materials: ["cloth", "hide"]
        }
        ,
        clothes:
        {
            name: "Casual Wear",
            type: "body",
            amount: 30,
            base: 25,
            materials:  ["cloth"]
        }
        ,
        suit:
        {
            name: "Suit",
            type: "body",
            amount: 45,
            base: 30,
            materials: ["cloth"]
        }
        ,
        larmor:
        {
            name: "Light Armor",
            type: "body",
            amount: 40,
            materials: ["metal", "scale", "wood"],
            base: 20
        }
        ,
        armor:
        {
            name: "Armor",
            type: "body",
            amount: 60,
            base: 40,
            materials: ["metal", "scale"]
        }
        ,
        harmor:
        {
            name: "Heavy Armor",
            type: "body",
            amount: 200,
            materials: ["metal"],
            base: 80
        }
        ,
        sharmor:
        {
            name: "Superheavy Armor",
            type: "body",
            amount: 1250,
            base: 180
        }
        ,
        shortsword:
        {
            name: "Shortsword",
            type: "hand",
            subtype: "blade",
            hands: 1,
            amount: 5,
            material: ["bone", "metal", "wood"],
            base: 20
        }
        ,

        sword:
        {
            name: "Sword",
            type: "hand",
            subtype: "blade",
            hands: 1,
            amount: 10,
            material: ["bone", "metal", "wood"],
            base: 40,
            magic: 30
        }
        ,

        longsword:
        {
            name: "Longsword",
            type: "hand",
            subtype: "blade",
            hands: 1,
            amount: 20,
            material: ["bone", "metal", "wood"],
            base: 65
        }
        ,

        broadsword:
        {
            name: "Broadsword",
            type: "hand",
            subtype: "blade",
            hands: 2,
            amount: 70,
            material: ["bone", "metal", "wood"],
            base: 150
        }
        ,
        wand:
        {
            name: "Wand",
            type: "hand",
            subtype: "magic",
            hands:1,
            amount: 3,
            materials: ["bone", "wood", "metal"],
            base: 5,
            magic: 50
        }
        ,
        staff:
        {
            name: "Staff",
            type: "hand",
            hands: 2,
            subtype: "magic",
            amount: 15,
            materials: ["wood", "bone"],
            base: 15,
            magic: 110


        }
        ,
        pickaxe:
        {
            name: "Pickaxe",
            type: "hand",
            hands:1,
            subtype: "pickaxe",
            amount: 15,
            base: 15,
            materials: ["metal","bone", "wood", "stone"]
        }
    }
    ,
    equipQMult: function (e)
    {
        if (! ("quality" in e)) return 0; // obvious error but wont cause crash

        if (e.quality === null) return 10; // items blessed by tux (hacked dev toys >:D)

        else return 1 - (1 / Math.log(e.quality/100 + Math.E));
    }
    ,
    equipAtk: function (e)
    {
        if (!e) return 0;
        return Math.max(20, (this.equips[e.type].base || 20) * (this.materials[e.material].sharpness || 20) * this.equipQMult(e));
    }
    ,
    equipDef: function (e)
    {
        if (!e) return 0;
        return Math.max(20, (this.equips[e.type].base || 20) * (this.materials[e.material].strength || 20) * this.equipQMult(e));
    }
    ,
    equipName: function(e)
    {
        if (!e) return "Nothing";
        var qm = this.equipQMult(e);
        var qs;
        var qdt = [
            [0, "Failure of a %"],
            [0.3, "Really shity %"],
            [0.5, "Ordinary %"],
            [0.70, "Fine %"],
            [0.82, "Excellent %"],
            [0.87, "Superb %"],
            [0.92, "Supreme %"],
            [0.94, "Legendary %"],
            [0.97, "Sacred %"],
            [1, "Divine % (hacked >:3)"]
        ];

        for (var x in qdt) if (qm >= qdt[x][0]) qs = qdt[x][1];


        return qs.replace(/\%/, (this.materials[e.material].name + " " + this.equips[e.type].name));
    }
});
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
(
/** @scope script.modules.rpg_game */
{
    /** List of modules to be required.
     * @type {string[]}
     */
    require: ["io", "com", "theme", "commands", "util", "logs", "less"]
    ,
    /** List of files to be included in this module.
     * @type {string[]}
     */
    include: ["rpg_areas", "rpg_player", "rpg_entity", "rpg_actions",
              "rpg_mobs", "rpg_equips", "rpg_materials", "rpg_moves",
             "rpg_battle"]
    ,
    /** I/O database that keeps track of games etc.
     * @type {IOdatabase}
     */
    database: null
    // database stores the permanent data, games, etc.
    ,
    /** channel */
    channels: null
    // channels is used to associate databases with channels, it doesn't keep between reloads
    ,
    hooks: null
    // hooks associates rpgs with pipes
    // not used as it should be for right now, will be fixed later
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
    }
    ,
    unloadModule: function ()
    {
        this.io.closeDB("rpg_game");
    }
    ,
    step: function ()
    {
        for (var x in this.channels)
        {
            this.RPGStep(this.channels[x]);
        }
    }
    ,
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

        for (x in rpg.battles)
        {
            this.rpgStep( {rpg:rpg, battle: rpg.battles[x] });
        }
    }
    ,
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

            for (var x in newr.areas)
            {
                newr.areas[x].battles = [];
            }

	    return newr;
        }

        return newr;
    }
    ,
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


        this.hooks[rpgname].running = true;

    }
    ,
    /** @type commandDescriptor */
    rpg: // not to be confused with "RPG"
    {
        desc: "does rpg stuffs",
        perm: function ()
        {
            return true;
        }
        ,
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
                var subactions = actions[x].split(/[,:]/g);

                if (subactions.length == 0) continue;

                subactions[0] = subactions[0].toLowerCase();
                if (subactions[0] in this.rpgActions)
                {
                    this.rpgActions[subactions[0]].apply(this, [src, subactions, chan, {player:player, rpg: rpg }] );
                }
            }
        }
    }
    ,
    /** @type commandDescriptor */
    loadrpg:
    {
        desc: "Loads an RPG into a channel."
        ,
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
    items:
    {
        ironore:
        {
            name: "Lump of Iron Ore",
            material: "iron",
            base: 2
        }
        ,
        shroomcap:
        {
            name: "Mushroom Cap"
        }
    }
});
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
    /*
      Ideally these should be (relatively) realistic:

      hardness (Vickers) / 10 
      density (g/cm^3) *10
      resistance (nΩ·m) / 5
      thermal 100/(W·m−1·K−1)
      opacity (opaque%)

      Mark details where this has been looked up with //(*)

      Put //fictional for non-real materials, e.g.:

      dragontooth: 
      {
      // fictional
          hardness: ...
          ...       
      }
      
      

    */
    materials: 
    {
        birch:
        {
            name: "Birch Wood",
            type: "wood",
            strength: 7,
            sharpness: 5,
            density: 5
        }
        ,
        ebony:
        {
            name: "Ebony Wood",
            type: "wood",
            strength: 35,
            sharpness: 10,
            density: 14
        }
        ,
        oak:
        {
            name: "Oak Wood",
            type: "wood",
            strength: 20,
            sharpness: 8,
            density: 8
        }
        ,
        ivory:
        {
            name: "Ivory",
            type: "bone",
            strength: 30,
            sharpness: 80,
            density: 15,
        }
        ,
        wdscale:
        {
            name: "White Dragon Scale",
            type: "scale",
            strength: 70,
            sharpness: 20,
            density: 15
        }
        ,
        wdfang:
        {
            name: "White Dragon Fang",
            type: "bone",
            strength: 10,
            sharpness: 60,
            density: 20
        }
        ,
        firedscale:
        {
            name: "Fire Dragon Scale",
            type: "scale",
            strength: 120,
            sharpness: 20,
            density: 35
        }
        ,
        firedfang:
        {
            name: "Fire Dragon Fang",
            type: "bone",
            strength: 30,
            sharpness: 80,
            density: 45            
        }
        ,
        sdscale:
        {
            name: "Sky Dragon Scale",
            type: "scale",
            strength: 50,
            sharpness: 15,
            density: 8,
        }
        ,
        sdfang:
        {
            name: "Sky Dragon Fang",
            type: "fang",
            strength: 15,
            sharpness: 40,
            density: 12
        }
        ,
        iron:
        {
            name: "Iron",
            type: "metal",
            strength: 60,
            sharpness: 40,
            density: 80
        }
        ,
        copper:
        {
            name: "Copper",
            type: "metal",
            strength: 40,
            sharpness: 30,
            density: 70
        }
        ,

        gold:
        {
            name: "Gold",
            type: "metal",
            strength: 20,
            sharpness: 10,
            density: 40
        }
        ,
        silver:
        {
            name: "Silver",
            type: "metal",
            strength: 25,
            sharpness: 10,
            density: 40
        }
        ,
        steel:
        {
            name: "Steel",
            type: "metal",
            strength: 120,
            sharpness: 60,
            density: 95
        }
        ,
        hgsteel:
        {
            name: "High-Grade Steel",
            type: "metal",
            strength: 150,
            sharpness: 70,
            density: 100
        }
        ,
        ti:
        {
            name: "Titanium",
            strength: 90,
            sharpness: 50,
            density: 40
        }
        ,
        ametal:
        {
            name: "Amorphorous Metal Alloy",
            type: "metal",
            strength: 125,
            sharpness: 350,
            density: 85
        }
        ,
        diamond:
        {
            name: "Diamond",
            type: "gem",
            strength: 200,
            sharpness: 250,
            density: 40
        }
        ,
        brass:
        {
            name: "Brass",
            type: "metal",
            strength: 140,
            sharpness: 60,
            density: 90
        }
        ,
        ruby:
        {
            name: "Ruby",
            type: "gem",
            strength: 100,
            sharpness: 250,
            density: 40
        }
        ,
        leather:
        {
            name: "Leather",
            type: "hide",
            strenth: 30,
            sharpness: 0,
            density: 5         
        }
        ,
        snakeskin:
        {
            name: "Snakeskin",
            type: "hide",
            strength: 25,
            sharpness: 5,
            density: 22
        }
        ,
        cotton:
        {
            name: "Cotton",
            type: "cloth",
            strength: 8,
            sharpness: 0,
            density: 3
        }
    }

})
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
    mobs:
    {
        eshroom:
        {
            name: "Evil Mushroom",
            desc: "A strange mushroom that turned into a monster. It didn't get any larger when that happened.",
            offense: 100,
            maxhp: 20,
            defense: 100,
            drops: [{
                prob: 1,
                item: "shroomcap",
                count: 1
            }]
        }
        ,
        dkfrog:
        {
            name: "Dark Frog",
            desc: "A frog that is controled by the powers of evil.",
            maxhp: 30,
            offense: 450,
            defense: 200
        }
        ,
        dsquirl:
        {
            name: "Deadly Squirl",
            desc: "Nuts with evil, this squirl is as fierce as squirls get!",
            maxhp: 40,
            offense: 1300,
            defense: 1600
        }
    }
});
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
/** @scope script.modules.rpg_game */
({
    /**
     * @namespace
     */
    moves:
    {
        /** Instakill kills all enemies instantly, no damage calculation
         * @param {rpgContext} ctx
         */
        instakill: function (ctx)
        {
            for (var x in targets)
            {
                targets[x].hp = 0;
            }
        }
        ,
        /** Physical does physical damage
         * @param {rpgContext} ctx
         */
        physical: function (ctx)
        {
            var offense = ctx.attacker.offense;
            var base = ctx.component.base;

            var defense = target.defense;

            var damage = base + base * Math.min(Math.max(-0.90, Math.log(offense/defense)), 9);

            target.hp -= damage | 0;
            }
        }
        ,
        /** Heal reverses damage.
         * @param {rpgContext} ctx
         */
        heal: function (ctx)
        {
            var base = ctx.movepower;

            for (var x in targets)
            {


             }
        }
    }
    ,
    pickMove: function (e)
    {
        return {
            name: "attack",
            components:[{ target: "opp", base:20, move: "physical", desc: "%s attacked %t!"}]
        };

        var plan = e.plan;

        var list = plan.list;
        var total = plan.total;
        var idx = Math.floor(Math.random()*(plan.total));
        for (var i = 0; list[i].pri <= idx; i++, idx -= list[i].pri) {}

        return list[i];
     }
});
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
    newPlayer: function ()
    {
        var newp = 
            {
                type: null,
                area: "town1",
                name: null,
                str: 100,
                res: 100,
                spd: 100,
                mag: 100,
                psy: 100,
                spr: 100,

                hp: 100, 
                mana: 100,
                men: 100,
                lp: 100,

                items: {},
                // Bulk items, e.g., iron ore (50)
                
                equips: [],
                // Single items

                battle: null,
                // Active battle ID

                activeActions: [],
                // Current action being executed. These occur outside of battle
                // And they are qued.


                bulkEffects: [],
                // All of these are executed at the same time.

                indvEffects: {},
                // Like bulkEffects, but an object instead of array.

                head: null,
                
                body:
                // Cotton clothing.
                {
                    
                    material: "cotton",
                    type: "clothes",
                    quality: 600
                }
                ,
                lhand: null,
                
                rhand: 
                // A wooden sword.
                {
                    material: "birch",
                    type: "sword",
                    quality: 600
                }

                ,

                feet:
                // Leather shoes
                {
                    material: "leather",
                    type: "shoes",
                    quality: 600
                }
                
            };
        return newp;
    }
    ,

    playerStep: function (player, ctx)
    {
        if (player.battling) return;
        // Regular player events don't occur while the player is in a battle!

        for (var x in player.activeActions)
        {
            if ("timer" in player.activeActions[x] && player.activeActions[x].timer-- <= 0)
            {
                if (player.activeActions[x].done) this.actions[player.activeActions[x].done].call(this, player.activeActions[x], { rpg: ctx.rpg, player:player, index: x });
                delete player.activeActions[x];
            }
            else if (player.activeActions[x].tick)
            {
                 this.actions[player.activeActions[x].tick].call(this, player.activeActions[x], { rpg: ctx.rpg, player:player, index: x });
            }
            break;
        }

        this.playerUpdateStats(player);
    }
    ,

    playerUpdateStats: function (e)
    {
        e.maxmp =  (e.mag*0.13 + (Math.log(e.mag+Math.E)*10 | 0));
        e.maxsp = (e.str*0.02 + e.res*0.02 + (Math.log(e.res/100+Math.E)*150 | 0));
        e.maxmsp = (e.res*0.01 + e.mag*0.01 + e.psy*0.12 + e.spr*0.01 + (Math.log(e.psy/1000+Math.E)*50 | 0));
        e.maxhp = (e.str*0.01 + e.res*0.03 + (Math.log(e.res/100+Math.E)*100 | 0));
        e.power = Math.floor(800*Math.log(3/2*e.str+e.psy/3+Math.E)+e.psy/25000+300);
        e.offense = Math.floor(e.power / 10000 * (100 + this.equipAtk(e.lhand) + this.equipAtk(e.rhand)));
        e.defense = Math.floor(e.power / 10000 * (100 + this.equipDef(e.lhand)/2 + this.equipDef(e.rhand)/2 + this.equipDef(e.body) + this.equipDef(e.feet) + this.equipDef(e.head) + this.equipDef(e.back)));
    }
});
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
/** This type of object contains the definitions of skills
 * @name rpgSkill
 * @class
 */
/** The name of the skill
 * @name name
 * @memberOf rpgSkill.prototype
 */
/** The cost of using the skill.
 * @name cost
 * @memberOf rpgSkill.prototype
 * @type rpgCost
 */
/** Skill level.
 * @name level
 * @type rpgSkillLevel
 * @memberOf rpgSkill.prototype
 */
/** The rpg skill levels: 0-F, 1-E, 2-D, 3-C, 4-B, 5-A, 6-S, 7-X, 8-O
 * @name rpgSkillLevel
 * @type Number
 * @class
 */
/**
 * @name rpgSkillComponent
 * @class
 */
/** Target of the component, either "self", "opp", "ally" or combinations of such (in array)
 * @name target
 * @memberOf rpgSkillComponent.prototype
 */
/** How many enemies to strike
 * @name count
 * @memberOf rpgSkillComponent.prototype
 */
/** Type of component, e.g., 'physical', 'magical', 'heal' etc.
 * @name move
 * @memberOf rpgSkillComponent.prototype
 */
/** The base damage done.
 * @name base
 * @memberOf rpgSkillComponent.prototype
 */


/** @scope script.modules.rpg_game */
({
    skills:
    {

        // Fighting track
        gpunch:
        {
            name: "Great Punch",
            // The name of the skill

            cost:
            // Cost to use the skill
            {
                sp: 100
                // Costs 100 stamina points
            }
            ,

            level: 1,
            // Level Class of the skill, has no effect on damage but serves to classify skills by strength

            threshold: 0,
            // Exp required for first use

            use: "none",
            // Item subclass required to use. "none" means empty hand.

            components:
            // Multiple components are supported, for example to damage the opponent and the user.
            [{
                target: "opp",
                // Target of the component, either "self", "opp", "ally" or combinations of such (in array)

                count: 1,
                // Number of targets to select. -1 is all targets possible

                move: "physical",
                // The function to be called for this component

                base: 10,
                // The base damage done if offence = defense
            }]
            ,
            related: { spunch: 0.5 }
            // Related skills that are given EXP points when you use this skill
        }
        ,

        spunch:
        {
            name: "Super Punch",
            cost:
            {
                sp: 150
            }
            ,
            level: 2,
            threshold: 0,
            use: "none",
            components:
            [{
                target: "opp",
                count: 1,
                move: "physical",
                base: 25,
            }]
            ,
            related: { spunch: 0.5 }
        }
        ,
        upunch:
        {
            name: "Ultra Punch",
            cost:
            {
                sp: 350
            }
            ,
            level: 3
            ,
            threshold: 0
            ,
            use: "none"
            ,
            components:
            [{
                target: "opp",
                count: 1,
                move: "physical",
                base: 45
            }]
            ,
            related: { spunch: 0.5 }
        }
        ,

        epunch:
        {
            name: "Hyper Punch",
            cost:
            {
                sp: 1750
            }
            ,
            level: 4,
            threshold: 0,
            use: "none",
            components:
            [{
                target: "opp",
                count: 1,
                move: "physical",
                base: 150
            }]
            ,
            related: { spunch: 0.5 }
        }
        ,
        barrage:
        {
            name: "Hyper Barrage",
            cost:
            {
                sp: 1575
            }
            ,
            level: 4,
            threshold: 0,
            use: "none",
            components:
            [{
                target: "opp",
                count: 1,
                hits: 5,
                move: "physical",
                base: 20
            }]
            ,
            related: { spunch: 0.5 }
        }
        ,
        epunch:
        {
            name: "Epic Punch",
            cost:
            {
                sp: 6250,
                mp: 300
            }
            ,
            level: 5,
            threshold: 0,
            use: "none",
            components:
            [{
                target: "opp",
                count: 1,
                move: "physical",
                base: 1500,
            }]
            ,
            related: { spunch: 0.5 }
        }
        ,
        opunch:
        {
            name: "Obilteratory Punch",
            cost:
            {
                sp: 12000,
                mp: 800
            }
            ,
            level: 6,
            threshold: 0,
            use: "none",
            components:
            [{
                target: "opp",
                count: 1,
                move: "physical",
                base: 3000
            }]
            ,
            related: { spunch: 0.5 }
        }
        ,
        warfist:
        {
            name: "Fist Strike of the Demigod",
            cost:
            {
                sp: 100000,
                mp: 10000
            },
            level: 7,
            threshold: null,
            use: "none",
            components:
            [{
                target: "opp",
                count: 1,
                move: "physical",
                base: 25000
            }],
        }
        ,


        // Healer path
        wish:
        {
            name: "Healing Wish",
            cost:
            {
                mp: 100
            }
            ,
            level:1
            ,
            use: "staff"
            ,
            components:
            [{
                target: ["self", "ally"],
                count: 1,
                move: "heal",
                base: 70
            }]
        }
        ,
        prayer:
        {
            name: "Healing Prayer",
            cost: {mst: 200, mp: 50},
            level: 2,
            use: "any",
            components: [{
                target: ["self", "ally"],
                count: 1,
                move: "heal",
                base: 200
            }]
        }
        ,
        invigor:
        {
            name: "Invigoration",
            cost: { mana: 500 },
            level: 3,
            use: "any",
            components:
            [{
                target: ["self", "ally"],
                count: 1,
                move: ["defmult", "spdmult", "stamult"],
                base: [1.1, 1.2, 1.5],
                duration: 5
            }]
        }
        ,
        smite:
        {
            name: "smite",
            cost: { mp: 120 },
            level: 1,
            use: "staff",
            components:
            [{
                target: "opp",
                count: 1
            }]
        }
        ,
        spark:
        {
            name: "Sparks"
            ,
            cost:
            {
                mp: 10
            }
            ,
            level:1
            ,
            threshold: null,
            use: "wand"
        }


    }
});
