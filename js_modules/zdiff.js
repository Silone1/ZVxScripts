({
     diff: function (text1, text2)
     {
         if (text1 == text2) return [];

         var diffs = [];

         var hashtab = {};




         var l1 = text1.split(/\n/g); // line old
         var l2 = text2.split(/\n/g); // line new CONST

         for (var i = 0; i < l2.length; i++)
         {
             if (l2[x] == l1[x]) continue;



             for (var i2 = i; i2 < i+50; i2++)
             {
                 if (l1[i2] == l2[i])
                 {
                     diffs.push(["-", i, i2 - i]); // subtract
                     l1.splice(i, i2 - i);
                     continue;
                 }
             }

             var df = ["+", i];
             for (var o = i; l1[o] != l2[i] && i < l2.length; i++)
             {
                 df.push(l2[i]);
                 l1[x].splice(i, 0, l2[i]);
             }

             l1[x].splice(i, 0, l2[i]);
         }

         return [];
     }
});