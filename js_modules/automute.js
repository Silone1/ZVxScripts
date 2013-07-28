({
     require: ["chat", "theme", "com"],

     counter:null,


     loadModule: function ()
     {
         this.chat.registerFilter(this.autoFilter, this);

         this.counter = new Object;
     },


     autoFilter: function (src, msg)
     {
         if (sys.auth(src) >= 2) return msg;
         var ip = sys.ip(src);

         if (! (ip in this.counter)) this.counter[ip] = 0;

         this.counter[ip] += 2;

         var bind = this.counter;

         sys.setTimer( function () {
                           bind[ip]--;
                       }, 2000, false);

         sys.setTimer( function () {
                           bind[ip]--;
                       }, 15000, false);

         if (this.counter[ip] >= 10)
         {
             this.com.message(src, "You are flooding, please message less.");
             return "";
         }
         else if (this.counter[ip] >= 15)
         {
             this.com.broadcast("~Script~ has kicked " + sys.name(src) + "! Reason: Flood", this.theme.WARN);
             sys.kick(src);
             return "";
         }

         return msg;
     }


 });