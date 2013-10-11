/*  ///////////////////////// LEGAL NOTICE ///////////////////////////////

 This file is part of ZVxScripts,
 a modular script framework for Pokemon Online server scripting.

 Copyright (C) 2013  Ryan P. Nicholl, aka "ArchZombie" / "ArchZombie0x", <archzombielord@gmail.com>

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 /////////////////////// END LEGAL NOTICE /////////////////////////////// */
/** ZSrX Module
 *
 */
({
     /** The ZSrX Function is an faster resource undemanding version of JSON.stringify. It has some limitations, in general, it ignores edge cases.
      *
      */
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

             else if (variant === null) strlt.push("null");

             else if (typeof variant === "object" && variant instanceof Array)
             {
                 if (--a === 0)
                     // Check for circular references
                 {
                     // if (olist.indexOf(variant) !== -1) throw new Error("Inconsitent object");
                     a = 3e+5;
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

                     a = 3e+4;
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

             else if (typeof variant === "boolean") strlt.push(""+variant);

             else if (variant === undefined) strlt.push("undefined");

             else strlt.push("'null'");




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