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


        e.sp += e.maxsp/20;
        e.msp += e.maxmsp/20;

        // Stamina
        if (e.sp < 0)
            // No stamina
        {
            e.hp += e.sp;
            // Reduce the HP by the amount of missing stamina.

            e.sp = 0;
            // Reset stamina
        }
        if (e.sp > e.maxsp / 3)
            // Has a fairly large amount of stamina
        {
            e.hp += e.maxhp/40;
            // Recover some HP
        }
        if (e.sp > e.maxsp)
            // Too much stamina!
        {
            e.sp = e.maxsp;
            // Remove overflow

            e.hp += e.maxhp/30;
            // recover extra hp!
        }

        // Mental Stamina
        if (e.msp < 0)
            // No mental stamina
        {
            e.mp -= e.msp;
            e.hp -= e.msp;
            // Lose hp and mana

            e.msp = 0;
            // Reset
        }
        if (e.msp > e.maxmsp / 3)
            // Recover mana
        {
            e.mp += e.maxmp/20;
            // increase
        }

        if (e.msp > e.maxmsp)
        {
            e.msp = e.maxmsp;
        }

        // Mana
        if (e.mp < 0)
            // Not enough mana
        {
            e.sp += e.mp;
            e.msp += e.mp;
            // Decrease staminas

            e.mp = 0;
            // Reset mana;
        }
        if (e.mp > e.maxmp)
            // Too much mana
        {
            if (e.mp > e.maxmp *1.1) e.hp += e.maxmp*1.1 - e.mp;
            // Decrease HP by overflow, uncontrolable mana damages body!

            e.mp = e.maxmp;
            // Reset
        }

        // Health
        if (e.hp <= 0 && !e.invincible && (!e.undead && e.hp > -e.maxhp*5))
            // check for death
        {
            // this.entityDie(e);
        }
        else if (e.hp > e.maxhp)
        // overflow
        {
            e.hp = e.maxhp;
            // reset
        }



    },

     entityUpdateStats: function (e)
     {
         e.maxmp =  (e.mag*0.13 + (Math.log(e.mag+Math.E)*10 | 0));
         e.maxsp = (e.str*0.02 + e.res*0.02 + (Math.log(e.res/100+Math.E)*150 | 0));
         e.maxmsp = (e.res*0.01 + e.mag*0.01 + e.psy*0.12 + e.spr*0.01 + (Math.log(e.psy/1000+Math.E)*50 | 0));
         e.maxhp = (e.str*0.01 + e.res*0.03 + (Math.log(e.res/100+Math.E)*100 | 0));
         //e.power = Math.floor(800*Math.log(3/2*e.str+e.psy/3+Math.E)+e.psy/25000+300);
         //e.offense = Math.floor(e.power / 10000 * (100 + this.equipAtk(e.lhand) + this.equipAtk(e.rhand)));
         //e.defense = Math.floor(e.power / 10000 * (100 + this.equipDef(e.lhand)/2 + this.equipDef(e.rhand)/2 + this.equipDef(e.body) + this.equipDef(e.feet) + this.equipDef(e.head) + this.equipDef(e.back)));
     }

});
