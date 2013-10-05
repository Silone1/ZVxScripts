({
     require: ["io"],

     counter: null,

     loadModule: function ()
     {
         this.counter = 0;
         this.io.registerConfig(this, { duration: 60000 });
     },

     step: function ()
     {
         if (this.counter >= this.config.duration)
         {
             this.counter = 0;

             sys.clearChat();
         }

         counter++;
     }

 });
