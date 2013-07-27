({

     zdiff: function (text1, text2)
     {
         text1 = text1.split(/\n/g);
         text2 = text2.split(/\n/g);

         var output = [];

         for (var i = 0; i < text1.length)
         {
             if (text1[i] == text2[i]) continue;

             var fwds = false;
             var bwds = false;
             var fwdloc = null;
             var bwdloc = null;

             var ulimit = Math.min(text2.length, text1.length, i + 50);

             l0: for (var x = i; x < ulimit; x++)
             {
                 if (!fwds && text1[i] == text2[x])
                     // If in text1 and text 2, inserted text
                 {
                     fwds = true;

                     if (bwds) break l0;
                 }
                 if (!bwds && text2[i] == text1[x])
                     // deleted text
                 {
                     bwds = true;
                     if (fwds) break l0;
                 }

             }

             if (fwds && bwds)
                 // swaptext
             {


             }

         }

     }
 });