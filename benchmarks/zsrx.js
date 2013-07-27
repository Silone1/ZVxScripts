(function (){
     var t1 = new Object;


     for (var x = 0; x < 10000; x++) t1[x] = {
         "test": x+" :)"
     };


     var st = + new Date;

     JSON.stringify(t1);

     print("JSON.stringify 10,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");

     st = +new Date;

     script.modules.zsrx.zsrx(t1);

     print("ZSRX 10,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");


     for (var x = 0; x < 30000; x++) t1[x] = {
         "test": x+" :)"
     };


     var st = + new Date;

     JSON.stringify(t1);

     print("JSON.stringify 30,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");

     st = +new Date;

     script.modules.zsrx.zsrx(t1);

     print("ZSRX 30,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");



     for (var x = 0; x < 1000000; x++) t1[x] = {
         "test": x+" :)"
     };


     st = +new Date;

     var recover = script.modules.zsrx.zsrx(t1);

     print("ZSRX 1,000,000 subobjects benchmark: " +(+new Date - st) + " miliseconds. (Don't try this with JSON!)");

     st = +new Date;

     JSON.parse(recover);

     print("JSON.parse 1,000,000 subobjects benchmark: " +(+new Date - st) + " miliseconds. ");

     st = +new Date;

     sys.write("testout", recover);

     print("sys.write 1,000,000 subobjects benchmark: " +(+new Date - st) + " miliseconds. ");


 })();