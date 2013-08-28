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
(
{
    require: ["com", "theme", "commands", "user"],


    activeTours: null,


    tourOf: null,


    matchIDs: null,


    version: 1,


    loadModule: function()
    {
        this.activeTours = new Object;
        this.tourOf = new Object;
        this.matchIDs = new Object;
    },


    tourAdd: function (tour, src)
    {
        var lowname = this.user.name(src).toLowerCase();

        if (tour.players.indexOf(lowname) !== -1) return false;

        tour.players.push(lowname);

        return true;
    },


    hotswap: function ()
    {
        if (old.verison != this.version) return false;


        this.activeTours = old.activeTours;
        return true;
    },


    newRound: function (tour)
    {
        this.util.shuffle(tour.players);

        for (var i = 0; i < tour.players.length -1; i += 2)
        {
            this.com.broadcast(tour.players[i] + " V.S. " + tour.players[i + 1] + "!", this.theme.TOUR);
            tour.matchups.push([tour.players[i], tour.players[i+1]]);
        }
    },


    beforeBattleStarted: function (source, target, clauses, rated, mode, battleid, team1, team2)
    {
        if (!this.tourOf[source] && !this.tourOf[target]) return;

        var tour = this.tourOf[source];

        if (tour != this.tourOf[target])
        {
            this.com.message([source, target], "Players in a tournament may only battle their opponent!", this.theme.WARN);
            sys.stopEvent();
            return;
        }

        var matchup_id;

        matchup_check:
        {
            var matchups = tour.matchups;

            for (var x in matchups) if (matchups[x].indexOf(this.user.name(source).toLowerCase()) != -1 && matchups[x].indexOf(this.user.name(target).toLowerCase()) !== -1)
            {
                matchup_id = x;
                break matchup_check;
            }

            this.com.message([source, target], "Players in a tournament may only battle their opponent!", this.theme.WARN);
            sys.stopEvent();
            return;
        }

        var tier = tour.tier;

        if (tier)
        {
            if (sys.tier(source, team1) !== tier)
            {
                this.com.message([source, target], this.user.name(source) + " is in the wrong tier!");
                sys.stopEvent();
                return;
            }

            if (sys.tier(target, team2) !== tier)
            {
                this.com.message([source, target], this.user.name(target) + " is in the wrong tier!");
                sys.stopEvent();
                return;
            }
        }

        this.matchIDs[source] =
        this.matchIDs[target] =
                                battleid;

        return;

    },

    afterBattleEnded: function (winner, loser, result, battle_id)
    {

        if (this.matchIDs[battleid])
        {
            var tour = this.tourOf[winner];

            if (result === "tie")
            {
                this.com.broadcast(this.user.name(winner) + " and " + this.user.name(loser) + " tied!");
            }
            else
            {
                this.com.broadcast(this.user.name(winner) + " defeated " + this.user.name(loser) + "!");
                var lname = this.user.name(loser).toLowerCase();

                tour.players[lname]--;
                if (tour.players[lname] <= 0) delete tour.players[x];
            }

            this.tour.matchups[this.matchIDs[battleid]] = []; // Don't want to delete

            this.checkTour(tour);

            return;
        }
    },


    checkTour: function (tour)
    {
        var players = tour.players;

        if (players.length <= 1)
        {
            if (players.length == 1)
            {
                this.com.broadcast(this.user.name(sys.id(tour.players[0])) + " won the tournament!");

                for (var x in this.activeTours) if (this.activeTours[x] === tour)
                {
                    delete this.activeTours[x];
                }


            }
        }
    }


});