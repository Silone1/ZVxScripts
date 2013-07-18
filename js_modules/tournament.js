(
{
    require: ["com", "theme", "commands"],

    activeTours: null,

    loadModule: function()
    {
        this.activeTours = new Object;
    },

    version: 1,

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

    beforeBattleStarted: function ()
    {


    }

    battleEnded: function (tour, winner, loser)
    {
        var wname = this.user.name(winner).toLowerCase();
        var lname = this.user.name(loser).toLowerCase();

        loop0: for (var x in tour.matchups) if (tour.matchups[x].indexOf(wname) !== -1 && tour.matchups[x].indexOf(lname) !== -1)
        {
            this.com.broadcast(this.user.name(winner) + " defeated " + this.user.name(loser) + "!");

            loop1: for (var x3 in tour.players) if (tour.players[x3].toLowerCase() == lname) { tour.players.splice(x3, 1); break loop1; }




        }






    }


}
);