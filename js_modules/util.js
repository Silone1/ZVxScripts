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
/** Utilities module
 * @memberof script.modules
 * @name util
 * @namespace
 */
/** @scope script.modules.util */
({
     hotswap: true
     ,
     /** Binds a function and object together.
      * @param {Object} obj The object to be used as "this" when calling func.
      * @param {Function} func The function to be called.
      * @return A new function which is a clone of func, but where the this object is always obj.
      */
     bind: function (obj, func)
     {
         return function ()
         {
             return func.apply(obj, arguments);
         };

     }
     ,
     /** Converts a value to an array if it isn't already one.
      * @param variant The value to be wrapped in an array if it isn't already one
      * @return {Array}
      * @example arrayify(8) >> [8], arrayify([7, 8]) >> [7, 8]
      */
     arrayify: function (variant)
     {
         if (typeof variant === "undefined" || variant === null) return variant;
         if (typeof variant !== "object" || !(variant instanceof Array)) return [variant];

         return variant;
     },

     concatSets: function ()
     {
         var output = [];

         for (var i = 0; i < arguments.length; i++)
         {
             arguments[i] = this.arrayify(arguments[i]);
             var s = arguments[i];
             for (var x2 in s)
             {
                 if (output.indexOf(s[x2]) == -1) output.push(s[x2]);
             }
         }

         return output;
     },
     /** Shuffles the array.
      * @param array Array to be shuffled.
      */
     shuffle: function (array)
     {
         // fisheryates
         var i = array.length;
         var temp;
         var rand;

         for (i = array.length; i;)
             // Shuffles the array
         {
             rand = Math.floor(Math.random() * i--);
             temp = array[i];
             array[i] = array[rand];
             array[rand] = temp;
         }
     }
     ,
     /** Inspects variant
      * @param variant Value to be inspected
      * @param {Boolean} exclude If duiplicates should only be printed once. (recommended)
      * @return {String} Human readable representation of variant.
      */
     inspect: function (variant, exclude)
     {
         // Rather complicated function, bear with it!
         /** The stack frames variable includes all the objects we are already inside of, to catch circular references. */
         var stack_frames = [];

         /** The refs varible keeps track of all the objects we have touched at any time, to catch duiplcate references */
         var refs = [];


         function serialize (variant)
         {
             if (typeof variant === "undefined")
             {
                 return "<Undefined>";
             }

             if (variant === null)
             {
                 return "<Null>";
             }

             if (typeof variant === "number")
             {
                 return "<Number> " + variant;
             }

             if (typeof variant === "string")
             {
                 return "<String> " + JSON.stringify(variant);
             }

             if (typeof variant === "boolean")
             {
                 return "<Bool> " + JSON.stringify(variant);
             }

             if (typeof variant === "function")
             {
                 // Right now most all fucntions would be anonymous, but later we may add features to sys to make it able to read more function information :)
                 return "<Function> [[" + (variant.name?variant.name:"<anonymous>") + "]]";
             }

             if (typeof variant === "object")
             {
                 var refidx = refs.indexOf(variant);
                 var dup = true;

                 var str = "";

                 if (refidx === -1)
                 {
                     refidx = refs.length;
                     refs.push(variant);
                     dup = false;
                 }

                 str += "<" + (variant instanceof Array ? "Array" : "Object") + " &" + refidx + ">";
                 // Arrays still do not look very nice, they have object syntax.


                 if (stack_frames.indexOf(variant) != -1)
                 {
                     str += " [[Circular Reference]]";
                     return str;
                 }
                 else if (dup)
                 {
                     str += " [[Duplicate Reference]]";
                     return str;
                 }

                 str += "\n";

                 for (var i = 0; i < stack_frames.length; i++) str += "    ";

                 str += "{\n";

                 stack_frames.push(variant);

                 for (var x in variant)
                 {
                     for (i = 0; i < stack_frames.length; i++) str += "    ";
                     str += JSON.stringify(x) + ": " + serialize(variant[x]) + "\n";
                 }

                 stack_frames.pop();

                 for (i = 0; i < stack_frames.length; i++) str += "    ";
                 str += "}";

                 return str;
             }

             return "?";
         }

         return serialize(variant);
     },


     UNARY_REGISTOR: 1, LIST_REGISTOR: 1,
     BINARY_REGISTOR: 2, ASSOCIATIVE_REGISTOR: 2,
     TERITARY_REGISTOR: 3,


     /** Generates a registor for use by the module.
      * @param host The module to use.
      * @param {this.LIST_REGISTOR|this.ASSOCIATIVE_REGISTOR} type
      * @param {String} storename The name of the property on the host to use as the registry.
      * @param {Boolean} direct If the registor copies the value directly or from a property of the registering module.
      * @param {String} onRegister Name of callback event to use when the program is run.
      */
     generateRegistor: function (host, type, storename, direct, onRegister)
     {
         if (type === this.LIST_REGISTOR)
         {
             host[storename] || (host[storename] = []);

             return function (module, applicant)
             {
                 var registrant = (direct? applicant : module[applicant]);

                 if (typeof registrant === "function" || typeof registrant === "object")
                 {
                     Object.defineProperty(registrant, "module", {value: module, configurable: true});
                 }

                 if (typeof registrant === "function")
                 {
                     registrant = this.util.bind(module, registrant);
                 }

                 host[storename].push(registrant);

                 module.onUnloadModule(
                     this.util.bind(
                         this,
                         function ()
                         {
                             host[storename].splice(host[storename].indexOf(registrant), 1);
                         }
                     )
                 );

                 if (host[onRegister]) return host[onRegister](module, registrant);

                 else return void 0;

             };

         }
         else if (this.ASSOCIATIVE_REGISTOR === type) return function (module, applicant, propname)
         {
             host[storename] || (host[storename] = new Object);

             var registrant = module[propnamme||applicant];

             if (typeof registrant === "function" || typeof registrant === "object")
             {
                 Object.defineProperty(registrant, "module", {value: module, configurable: true});
             }

             if (typeof registrant === "function")
             {
                 registrant = this.util.bind(module, registrant);
             }

             host[storename][applicant] = registrant;

             module.onUnloadModule(
                 function ()
                 {
                     host[storename].splice(host[storename].indexOf(registrant), 1);
                 }
             );


         };


         else return null; // unimplemented
     },

     keyify: function (array)
     {
         var ret = new Object;
         for (var x in array)
         {
             ret[array[x]] = null;
         }
         return ret;
     },

     cache: new Object,


     intToBin: function (i)
     {
         if (this.cache[i]) return this.cache[i];
         var bin = new sys.ByteArray(4);


         bin[0] = i & 255;
         if (i > 255)
             bin[1] = (i >> 8) & 255;
         if (i > 65535)
             bin[2] = (i >> 16) & 255;
         if (i > 16777215)
             bin[3] = (i >> 24) & 255;

         return this.cache[i] = bin;
     },

     binToInt: function (bin)
     {
         return bin[0] | (bin[1] << 8) | (bin[2] << 16) | (bin[3] << 24);
     },

     binToIntO: function (bin)
     {
         return bin[3] | (bin[2] << 8) | (bin[1] << 16) | (bin[0] << 24);
     },

     ipMatchesSubnet: function (ip, subnet)
     {
         ip = ip.split(/\./g);

         var subnet_ip = subnet.split(/\//)[0].split(/\./g);
         var subnet_mask =  subnet.split(/\//)[1];

         var ipAddr = this.binToIntO(ip);
         var subAddr = this.binToIntO(subnet_ip);

         if (subnet_mask == 0) return true;

         ipAddr &= ~((1 << (32 - +subnet_mask)) - 1);

         return ipAddr == subAddr;


     }



});
