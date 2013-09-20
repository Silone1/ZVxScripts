({
     Locker: function (password, object)
     {
         var sha = sys.sha1;

         var salt = Math.random();
         var cryptpass =sha(  salt.toString() + password );

         password = null;

         return (
             function (passwd)
             {
                 if (sha(salt.toString() + passwd) == cryptpass) return object;

                 else return null;
             }
         );
     },

     HardCrypt: function (key, string)
     {
         var sha = sys.sha1;

         var salt = Math.random() + ":" + +new Date;
         var cryptoproc = sha(salt.toString() + key);

         var chrc = string.split("");
         string = null;

         var cryptoxormask = [];

         for (var x in chrc)
         {
             if (x >= cryptoxormask.length) cryptoxormask = cryptoxormask.concat((cryptoproc = sha((salt+x).toString() + cryptoproc) + sha1(cryptoproc + ":")).split());

             chrc[x] = String.fromCharCode(chrc[x].charCodeAt(0) ^ cryptoxormask[x].charCodeAt(0));

             cryptoxormask[x] = 0;
         }

         return [salt, chrc.join("")];

     },

     HardCryptReverse: function (key, crypt)
     {
         var sha = sys.sha1;

         var salt = crypt[0];

         var chrc = crypt[1].split("");

         var cryptoproc = sha(salt.toString() + key);



         var cryptoxormask = [];

         for (var x in chrc)
         {
             if (x >= cryptoxormask.length) cryptoxormask = cryptoxormask.concat((cryptoproc = sha((salt+x).toString() + cryptoproc) + sha1(cryptoproc + ":")).split());

             chrc[x] = chrc[x].charCodeAt(0) ^ cryptoxormask[x].charCodeAt(0);

             cryptoxormask[x] = 0;
         }

         for ( x in chrc)
         {
             chrc[x] = String.fromCharCode(chrc[x]);
         }

         return chrc.join("");
     }

 });
