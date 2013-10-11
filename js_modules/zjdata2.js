/* zjdata-like serialization that is byte based.
 *
 *
 *
 */

({
     require: ["util"],


     unmarshal: function (data)
     {

         var that = this;

         print(data.length);

         return parse();

         function parse()
         {
             const ARRAY = 0, OBJECT = 1, NUMBER = 2, END = 3, STRING = 4, DELETE = 5, SET = 6, PROP = 7, INT32 = 8, NULL = 9;

             var output, length, type;
             var unit = data[0];
             data = data.right(data.length - 1);
             print("UNIT: " + unit);
             print("POST RIGHT DATA LENGTH: " + data.length);
             switch(unit)
             {
             case NULL:
                 return null;

             case ARRAY:


                 length = that.util.binToInt(data.left(4));
                 output = new Array;
                 data = data.right(data.length - 4);

                 for (var i = 0; i < length; i++)
                 {
                     output[i] = parse();
                 }
                 return output;

             case OBJECT:

                 output = new Object;

                 length = that.util.binToInt(data.left(4));

                 output = new Array;
                 data = data.right(data.length - 4);

                 for (var i = 0; i < length; i++)
                 {
                     var keylen = that.util.binToInt(data.left(4));
                     data = data.right(data.length - 4);
                     var key = data.left(keylen);
                     data = data.right(data.length - keylen);

                     output[key.toString()] = parse();
                 }
                 return output;
             case STRING:
                 print("data leftovers " + data.length);
                 print(data[0] + " " + data[1]);
                 length = that.util.binToInt(data.left(4));

                 print("LENGTH : " + length);

                 output = data.right(data.length - 4).left(length).toString();
                 data = data.right(data.length - 4 - length);
                 return output;

             case INT32:
                 output = that.util.binToInt(data.left(4));

                 data = data.right(data.length - 4);
                 return output;
             case NUMBER:
                 length = that.util.binToInt(data.left(4));

                 output = data.right(data.length - 4).left(length);
                 data = data.right(data.length - 4 - length);
                 return +JSON.parse(output.toString());
             default:
                 return undefined;
             }


         }


     },

     BYTE: function () {
         var n = new Array(256); for (var i = 0; i < 256; i++)
         {
             n[i] = sys.ByteArray(1);
             n[i][0] = i;
         }

         return n;
     }(),

     marshal: function (object, ordered)
     {
         var output_ = sys.ByteArray(0);

         output_.reserve(150000);

         var outs = [];
         ordered = true;


         var that = this;

         var cache = new Object;

         function toBin (i)
         {
             if (cache[i]) return cache[i];
             var bin = new sys.ByteArray(4);


             bin[0] = i & 255;

             if (i > 16777215)
             {
                 bin[1] = (i >> 8) & 255;
                 bin[2] = (i >> 16) & 255;
                 bin[3] = (i >> 24) & 255;
                 return cache[i] = bin;
             }
             else if (i > 65535)
             {
                 bin[1] = (i >> 8) & 255;
                 bin[2] = (i >> 16) & 255;
                 return cache[i] = bin;
             }

             else if (i > 255)
             {
                 bin[1] = (i >> 8) & 255;
                 return cache[i] = bin;
             }
             return cache[i] = bin;



         }

         function toInt (bin)
         {
             return bin[0] | (bin[1] << 8) | (bin[2] << 16) | (bin[3] << 24);
         }

         parse(object);




         return output_;

         function parse (object)
         {
             const ARRAY = 0, OBJECT = 1, NUMBER = 2, END = 3, STRING = 4, DELETE = 5, SET = 6, PROP = 7, INT32 = 8, NULL = 9, UNDEFINED = 10;
             const output = output_;




             if (typeof object == 'string')
             {
                 var bin = sys.ByteArray(object);
                 output[output.length] = STRING;
                 output.append(toBin(bin.length)).append(bin);
             }

             else if (typeof object == 'number' && (object | 0) === object)
             {
                 output[output.length] = INT32;
                 output.append(toBin(object));
             }

             else if (typeof object == 'number')
             {
                 var bin = sys.ByteArray(JSON.stringify(object));
                 output.append(that.BYTE[NUMBER]).append(that.util.intToBin(bin.length)).append(bin);
             }

             else if (object === null) { output.append(NULL); }

             else if (typeof object == 'object' && object instanceof Array)
             {
                 output.append(that.BYTE[ARRAY]);
                 output.append(toBin(output.length));

                 for (var i = 0; i < object.length; i++)
                 {
                     parse(object[i]);
                     // output.append(that.BYTE[END]);
                 }


             }

             else if (typeof object == 'object')
             {
                 output.append(that.BYTE[OBJECT]);

                 if (ordered)
                 {
                     var keys = Object.keys(object);//.sort();

                     output.append(toBin(keys.length));

                     var l = keys.length;
                     for (var x = 0; x<l; x++)
                     {
                         var i = keys[x];
                         var ib = sys.ByteArray(i);

                         output.append(toBin(ib.length)).append(ib);
                         parse(object[i]);
                     }

                 }
             }



         }

         return output;
     }
 });