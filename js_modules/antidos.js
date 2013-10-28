({

     require: ["time", "io", "util", "com", "theme"],

     ipdata: null,

     loadModule: function ()
     {
         this.ipdata = new Object;

         this.script.registerHandler("beforeIPConnected", this);
         this.script.registerHandler("beforeLogIn", this);

         this.io.registerConfig(this, {  limit: 10,  time: 600000, wayOverLimit: 60,  wayOverTime: 1209600000 } );
     },

     beforeLogIn: function (src)
     {
         var ip = sys.ip(src);

         if (this.ipdata[ip] >= 10)
         {
             this.com.message(src, "Exceeded attempt login limit. Limit " + this.config.limit + " login attempts per " + this.time.diffToStr (this.config.time)+ ". Note: Failed attempts are counted towards this limit.");
             sys.stopEvent();
             return;
         }
     },

     beforeIPConnected: function (ipaddr)
     {
         if (! (ipaddr in this.ipdata))

         {
             this.ipdata[ipaddr] = 0;

             return;

         }

         if (this.ipdata[ipaddr]++ >= this.limit + 5) sys.stopEvent();

         var that = this;



         print("timer register");
         sys.setTimer(
             function ()
             {
                 print("timer drop");
                 that.ipdata[ipaddr]--;

             },

             (this.ipdata[ipaddr] <= this.config.overLimit ?  this.config.time :  this.config.wayOverTime ),

             false
         );



     }


 });