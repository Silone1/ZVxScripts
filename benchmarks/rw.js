(function (){
     var t1 = new Object;
     var st;

     for (var x = 0; x < 10000; x++) t1[x] = {
         "test": x+" :)"
     };


     var st = + new Date;
     JSON.stringify(t1);
     print("JSON.stringify 10,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");

     st = +new Date;
     script.modules.zsrx.zsrx(t1);
     print("ZSRX 10,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");

     st = +new Date;
     script.modules.zjdata.stringify(t1);
     print("ZjData 10,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");
     /*
     st = +new Date;
     script.modules.zjdata2.marshal(t1);
     print("zjdata2 10,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");*/


     for (var x = 0; x < 30000; x++) t1[x] = {
         "test": x+" :)"
     };

/*
     st = + new Date;
     JSON.stringify(t1);
     print("JSON.stringify 30,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");
     */
     st = +new Date;
     script.modules.zsrx.zsrx(t1);
     print("ZSRX 30,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");

     st = +new Date;
     script.modules.zjdata.stringify(t1);
     print("zjdata 30,000 subobjects benchmark: " +(+new Date - st) + " miliseconds.");



     for (var x = 0; x < 1000000; x++) t1[x] = {
         "test": x+" :)"
     };


     st = +new Date;
     var recover = script.modules.zsrx.zsrx(t1);
     print("ZSRX 1,000,000 subobjects benchmark: " +(+new Date - st) + " miliseconds. (Don't try this with JSON!)");

     st = +new Date;
     var recover2 = script.modules.zjdata.stringify(t1);
     print("Zjdata.stringify 1,000,000 subobjects benchmark: " +(+new Date - st) + " miliseconds. (Don't try this with JSON!)");
     /*
     st = +new Date;
     JSON.parse(recover);
     print("JSON.parse 1,000,000 subobjects benchmark: " +(+new Date - st) + " miliseconds. ");
     /*
     st = +new Date;
     script.modules.zsrz.parse(recover2);
     print("ZSRZ.parse 1,000,000 subobjects benchmark: " +(+new Date - st) + " miliseconds. ");*/

     /*st = +new Date;

     sys.write("output", recover);

     print("sys.write 1,000,000 subobjects benchmark: " +(+new Date - st) + " miliseconds. ");*/

     st = +new Date;
     script.modules.zsrx.zsrx(script.modules.io.openDBs);
     print("ZSRX io.openDBs benchmark: " +(+new Date - st) + " miliseconds. (Don't try this with JSON!)");

     st = +new Date;
     script.modules.zjdata.stringify(script.modules.io.openDBs);
     print("ZSRZ.stringify io.openDBs benchmark: " +(+new Date - st) + " miliseconds. (Don't try this with JSON!)");

     return;


 });