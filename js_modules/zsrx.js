// zsrx algorithm
// Because serializing >1,000,000 key objects with JSON is stupidly slow.
// 10 times faster than JSON.stringify :)
({
     zsrx: function (inst)
     {
         var olist = [];
         var strlt = [];

         var depth = 0;
         var dstr = "";

         var flashstr = [];

         var a = 3e+2; // anti-hang circular counter

         function srsz (variant)
         {
             if (typeof variant == "number") strlt.push(""+ variant);

             else if (typeof variant == "string") strlt.push(JSON.stringify(variant));

             else if (typeof variant === "object" && variant instanceof Array)
             {
                 if (--a === 0)
                     // Check for circular references
                 {
                     // if (olist.indexOf(variant) !== -1) throw new Error("Inconsitent object");
                     a = 3e+2;
                     flashstr.push(strlt.join(""));
                     strlt = [];
                     gc();
                 }

                 strlt.push("[\n");
                 dstr += " "; // indent

                 for (var x in variant)
                 {
                    
                     strlt.push(dstr);

                     srsz(variant[x]);

                     strlt.push(",\n");
                 }

                 if (strlt[strlt.length-1] === ",\n") strlt.pop(); // remove trailing comma

                 dstr = dstr.substring(1); // unindent

                 strlt.push("\n" +dstr+"]");
             }

             else if (typeof variant == "object") 
             {
                 if (--a === 0)
                     // Check for circular references
                 {
                     //if (olist.indexOf(variant) !== -1) throw new Error("Inconsitent object");

                     a = 3e+2;
                     flashstr.push(strlt.join(""));
                     
                     strlt = [];
                     gc();
                 }

                 strlt.push("{\n");
                 dstr += " "; // indent

                 for (var x in variant)
                 {
                    
                     strlt.push(dstr + JSON.stringify(x) + ": ");

                     srsz(variant[x]);

                     strlt.push(",\n");
                 }

                 if (strlt[strlt.length-1] === ",\n") strlt.pop(); // remove trailing comma

                 dstr = dstr.substring(1); // unindent

                 strlt.push("\n"+dstr+"}");
             }
             
         }

         srsz(inst);

         if (strlt[strlt.length-1] == "]\n")
         {
             strlt.pop();
             strlt.push("]");
         }

         if (strlt[strlt.length-1] == "}\n")
         {
             strlt.pop();
             strlt.push("}");
         }

         
         return flashstr.join("") + strlt.join("");
     }

})