({
     require: ["commands", "io", "util", "com", "theme"]
     ,
     database: null
     ,
     loadModule: function ()
     {
     var database = this.io.openDB("tours");
     this.tours = database.chans;
     }
     ,
     unloadModule: function ()
     {
     this.io.closeDB("tours");
     }
     ,
     newtour:
     {
     perm: function (src)
     {
         return sys.auth(src) >= 1;
     }
     ,
     code: function (src, cmd, chan)
     {
         if (this.tours[sys.channel(chan).toLowerCase()])
         {
         this.com.message([src], "Channel already has a running tournament.", this.theme.WARN);
         return;
         }
         
         var tr = this.tours[sys.channel(chan).toLowerCase()] = new Object;

         this.com.broadcast(sys.name(src) + " has started a new tournament in #" + sys.channel(chan));

         tr.type = "single";

         tr.players = [];

         return;
        
     }
     }
     ,
     jointour: 
     {
     perm: function ()
     {
         return true;
     }
     ,
     code: function (src, cmd, chan)
     {
         var tr = this.tours[sys.channel(chan).toLowerCase()];
         
         if (!tr)
         {
         this.com.message(src, "No")
         
         }
     }
     }
     ,
     afterBattleEnded:
});