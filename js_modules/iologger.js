({
     require: ["io", "logs"],

     loadModule: function ()
     {
         this.io.registerIOWatcher(this, "IOLogger");
     },

     IOLogger: function (db, iop, time)
     {
         var convtab = new Object;
         
         convtab[this.io.OPEN] = "Opened";
         convtab[this.io.CLOSE] = "Closed";
         convtab[this.io.SYNC] = "Synchronized";
         convtab[this.io.COMMIT] = "Commited changes to";
         convtab[this.io.BACKUP] = "Backed up";
         convtab[this.io.PURGE] = "Purged";

         if (!convtab[iop]) return;

         this.logs.logMessage(this.logs.IO, convtab[iop] + " database " + db + ", took " + time + " miliseconds.");
     }
});