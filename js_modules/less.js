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
/** Provides the less function
 * @name less
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.less */
({
     require: ["chat", "com", "theme", "io", "user"],




     loadModule: function ()
     {
         this.io.registerConfig(
             this,
             {
                 fmtEnd: "<span style='color:white;background-color:black'>END OF TEXT. EXITED VIEW MODE.</span>",
                 fmtPage: "<span style='color:white;background-color:black'>END OF PAGE <pagenumber/> OF <pagecount/>. TYPE 'NEXT' TO GO FORWARD, 'EXIT' TO QUIT.</span>",
                 fmtError: "<span style='color:white;background-color:black'>YOU ARE IN VIEW MODE. TYPE 'NEXT' TO GO TO THE NEXT PAGE, OR 'QUIT' TO EXIT VIEW MODE.</span>",
                 defaultLessLength: 30,
                 defaultLessEnabled: true

             });

         this.user.registerConfigHook(this, "configuration");
     },


     configuration: function (c)
     {
         if (!c.lessLength) c.lessLength = this.config.defaultLessLength;

         if (!( "lessEnabled" in c)) c.lessEnabled = this.config.defaultLessEnabled;
     },

     /** Less function
      * @param {Number} src User to send less to
      * @param msg The message to send
      * @param html If msg is html.
      */
     less: function (src, msg, html)
     {
         var lines;

         var cfg = this.user.userConfig(src);

         if (!cfg.lessEnabled) this.com.message(src, msg, -1, html);

         if (!html) lines = msg.split(/\n/g);
         else lines = msg.split(/<\s*br\s*\/?>/g);


         if (src == 0 || cfg.lessLength >= lines.length) {
             this.com.message(src, msg, -1, html);
             return;
         }

         var p = 0;

         var bind = this;

         function showPage()
         {

             for (var i = 0; ((i < cfg.lessLength) && (i+(cfg.lessLength*p) < lines.length)); i++)
             {
                 bind.com.message(src, lines[i+cfg.lessLength*p], -1, html);
             }


             p++;

             if (p*cfg.lessLength >= lines.length)
             {
                 bind.com.message([src], bind.config.fmtEnd, -1, true);
                 return;
             }
             var maxpages =  Math.ceil(lines.length / cfg.lessLength);

             bind.com.message([src], bind.config.fmtPage.replace(/<pagenumber\s*\/\s*>/g, p).replace(/<pagecount\s*\/\s*>/g, maxpages), -1, true);

             bind.chat.registerCapture(src, handle, bind);

         }

         function handle (_, msg)
         {
             var lmsg = msg.toLowerCase();
             if (lmsg === "exit" || lmsg === "e" || lmsg === "q" || lmsg === "quit")
             {
                 bind.com.message([src], this.config.fmtEnd, -1, true);
                 return;
             }

             if (lmsg === "next" || lmsg === "n")
             {
                 showPage();
                 return;
             }
             var maxpages =  Math.ceil(lines.length / cfg.lessLength);
             bind.com.message([src], bind.config.fmtError.replace(/<pagenumber\s*\/\s*>/g, p).replace(/<pagecount\s*\/\s*>/g, maxpages), -1, true);
             bind.chat.registerCapture(src, handle, bind);
         }

         showPage(this);
     }
 });
