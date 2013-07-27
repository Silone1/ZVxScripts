({
     require: ["test", "com"],

     loadModule: function ()
     {
         this.test.registerTest("qtest", this);
     },


     qtest: function ()
     {
         this.com.broadcast("qtest!");
     }
});