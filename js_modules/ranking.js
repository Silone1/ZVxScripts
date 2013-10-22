({
     require: ["commands", "com", "theme", "util", "text", "user"],

     meta:
     {
         commands: ["ranking"]
     },

     ranking:
     {
         aliases: ["rating"],
         category: "pokemon",
         desc: "Shows your ranking in the ladder. May add tiers.",
         options:
         {
             rating: "Show your raw score."
         },
         perm: function () { return true; },

         server: false,
         code: function (src, cmd, chan)
         {
             var r, total, tier, tierx, tiers, x, c, i;

             if (cmd.name == "rating") cmd.flags.rating = true;

             tiers = cmd.args;

             if (tiers.length === 0)
             {
                 c = sys.teamCount(src);

                 for (i = 0; i < c; i++)
                 {
                     tiers.push(sys.tier(src, i));
                 }
             }

             tiers = this.util.concatSets(tiers);

              this.com.message(src, "Ranking"+(tiers.length === 1 ?"":"s")+":");

             for (x in tiers)
             {
                 tier = tiers[x];
                 tierx = this.text.escapeHTML(tier);

                 r = sys.ranking(this.user.name(src), tier);
                 total = sys.totalPlayersByTier(tier);

                 if (!total)
                 {
                     this.com.message(src, "ERROR: No such tier " + tier + "!", this.theme.WARN);
                 }
                 else if (!r)
                 {
                     this.com.message(src, "ERROR: You are not ranked in " + tier + "!", this.theme.WARN);
                 }
                 else
                 {
                     this.com.message(src, "<b>" + tierx + "<b/>: "+"Ranked " + rank + " out of " + sys.totalPlayersByTier(tier) + " players. "+(cmd.flags.rating?"Score " + sys.ladderRanking(src, tier)+" ":"")+"(Top "+Math.ceil(rank/total*10000)/100 +"%)", -1, true);
                 }
             }
         }


     }

 });