/*  ///////////////////////// LEGAL NOTICE ///////////////////////////////

 This file is part of ZScripts,
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
/** Implements fast data serialization, but slower parses
 * @name zjdata
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.zjdata */
({
     /** The stringify function quickly turns an object into a text marshal.
      * @param variant The object to be serialized.
      * @param ordered If the object should be serialized in ordered mode.
      * @return Text marshal.
      */
     stringify: function (variant)
     {

         var strings = [];


         function write_back (variant, key)
         {
             if (typeof variant == "object")
             {
                 if (variant === null)
                 {
                     strings.push(JSON.stringify(["value", key, null]));
                     return;
                 }

                 if (! (variant instanceof Array)) strings.push("object\r" + JSON.stringify(key));

                 else strings.push("array\r" + JSON.stringify(key) + "\r" + variant.length);

                 if (ordered)
                 {
                     var keys = Object.keys(variant).sort();

                     for (var x in keys)
                     {
                         write_back(variant[keys[x]], keys[x]);
                     }

                 }

                 else for (var x in variant)
                 {
                     write_back(variant[x], x);
                 }

                 strings.push("end");

                 return;
             }

             else if (typeof variant == "number") strings.push("value\r" + JSON.stringify(key) + "\r" + variant.toString());

             else if (typeof variant == "string") strings.push("value\r" + JSON.stringify(key) + "\r" + JSON.stringify(variant));
         }

         write_back(variant);

         return strings.join("\n");

     },

     parse: function (text, variant)
     {
         var lines = text.split(/\n/g);

         var nest = [];
         var xv;

         for (var x in lines)
         {
             var i = lines[x];

             var o = i.split(/\r/g);

             if (o[1] && o[1][0] == "u") o[1] = undefined;
             else if (o[1]) o[1] = JSON.parse(o[1]);



             if (o[0] == "value")
             {

                 if (o[1] != null) variant[o[1]] = o[2];
                 else variant = o[2];
             }
             else if (o[0] == "object")
             {
                 xv = new Object;
                 if (o[1] != null) nest.push(variant);

                 if (o[1] != null) variant[o[1]] = xv;

                 variant = xv;


             }
             else if (o[0] == "end")
             {
                 if (nest.length) variant = nest.pop();
             }
             else if (o[0] == "array")
             {
                 xv = new Array(+o[2]);

                 if (o[1] !== null) nest.push(variant);

                 if (o[1] != null) variant[o[1]] = xv;

                 variant = xv;

             }
             else if (o[0] == "walk")
             {
                 nest.push(variant);

                 variant = variant[o[1]];
             }
             else if (o[1] == "delete")
             {
                 delete variant[o[1]];
             }

         }

         return variant;

     },

     /** Compiles a javascript memory representation of zjdata transactions into a string representation of the zjdata transactions.<br/>
      * @desc This can be used with the parse function to implement transactional I/O, etc.
      * @param exec The execution object.
      * @return The execution string.
      */
     compile: function (exec)
     {
         var output = [];
         for (var x in exec)
         {
             var s = exec[x][0];

             if (exec[x][1]) s += "\r" + (exec[x][1] == null ? "undefined" : JSON.stringify(exec[x][1]));

             if (exec[x][2]) s += "\r" + JSON.stringify(exec[x][2]);

             output.push(s);
         }
         return output.join("\n");
     },

     /** (WIP) Compares two jzdata marshals. (may not contain: walk, delete, duiplicate entries)
      * @param marshal1 First marshal.
      * @param marshal2 Second marshal.
      * @param ordered If the marshals are ordered, may provided a speedup in some cases, or not work at all.
      * @return Unparsed zjdata transactions.
      */

     /* Reference implementation (python):

      xs = [1,2,3,4,6,7]
      ys = [2,4,5,6,8]

      oxs = []
      oys = []

      i, j, m, n = 0, 0, len(xs), len(ys)

      while i < m and j < n:
        x, y = xs[i], ys[j]
      if x < y:
        oxs.append(x)
        i += 1
      elif x > y:
        oys.append(y)
        j += 1
      else:
        i += 1
        j += 1

      if i < m:
        oxs.extend(xs[i:])
      elif j < n:
        oys.extend(ys[j:])

      print(oxs)
      print(oys)


[1, 3, 7]
[5, 8]

      */
     diff: function (marshal1, marshal2, ordered)
     {
         var diffs = [];

         if (marshal1 == marshal2) return []; // no differences

         if (! ordered)
         {
             //unimplemented

             marshal1 = this.stringify(this.parse(marshal1), true); // make ordered hack
             marshal2 = this.stringify(this.parse(marshal1), true); // make ordered hack
         }

         var m1a = marshal1.split(/\n/g);
         var m2a = marshal2.split(/\n/g);

         var min = Math.min(m1a.length, m2a.length);

         var max = Math.max(m1a.length, m2a.length);

         var pathway1 = [];
         var pathway2 = [];


         function comparePathways(a, b)
         {
             for (var x in a)
             {
                 if (a[x] != b[x])
                 {
                     if ([a[x],b[x]].sort()[0] == a[x]) // a is first
                     {
                         return 1;
                     }
                     else return 2;
                 }
             }

             if (a.length < b) return 1;

             else if (b.length < a) return 2;

             return 0;
         }

         for (var i = 0; i < m2a.length; i++)
         {
             var parsed1 = m1a[i].split(/\r/g);
             if ((parsed1[0] == "object" || parsed1[0] == "array") && parsed1[1] != "undefined") pathway1.push(JSON.parse(parsed1[1]));


             var parsed2 = m2a[i].split(/\r/g);
             if ((parsed2[0] == "object" || parsed2[0] == "array") && parsed2[1] != "undefined") pathway2.push(JSON.parse(parsed2[1]));

             if (parsed1 == "end")

             if (m2a[i] != m1a[i])
             {
                 var res = comparePathways(pathway1.concat([JSON.stringify(m1a[i][1])]), pathway2.concat([JSON.stringify(m2a[i][1])]));

                 if (res == 1) // pathway1 < pathway2, deletion
                 {
                     var temps = [];
                     for (var x3 in pathway1)
                     {
                         temps.push(["walk",pathway1[x]]);
                     }

                     var walks = pathway1.length;


                 }
             }
         }



     }
 });