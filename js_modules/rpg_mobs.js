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
