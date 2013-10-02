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
({
     require: ["commands", "logs", "text", "theme", "com"],

     loadModule: function ()
     {
         //this.publicIP = sys.synchronousWebCall("http://icanhazip.com/");

         /* if (!this.publicIP || !this.publicIP.match(/^(\d{1,3}\.){3}\d{1,3}\n?$/))
          {
          //this.publicIP = null; //throw new Error("Could not initialize public IP")
          this.logs.logMessage(this.logs.CRITICAL, "Could not initialize public IP");
          return;
          }*/

         this.commands.registerCommand("getsource", this);
     },


     getsource:
     {
         perm: function ()
         {
             return true;
         }
         ,
         options:
         {
             client: "Sends the source into the client window, instead of a link if available."
         }
         ,
         code: function (src, cmd, chan)
         {

             var modules = [];

             if (cmd.flags.loaded) cmd.args = Object.keys(this.script.modules);
             if (cmd.flags.all) cmd.args = Object.keys(this.script.modInfo);

             var text = ["Source Code:"];

             if (cmd.args.length == 0)
             {
                 for (var x in this.script.modInfo)
                 {
                     if (!this.script.modInfo[x]) continue;
                     text.push("<b>Module " + x + " exists as a " +this.script.modInfo[x].type+ " module at "+this.script.modInfo[x].path+" in state "+this.script.modInfo[x].state+".</b>");
                 }

                 this.com.message(src,text.join("<br/>"), this.theme.INFO, true);
                 this.com.message(src, "Try /getsource <modname>, or /getsource --loaded or /getsource --all", this.theme.INFO);
                 return;
             }



             for (var x in cmd.args)
             {
                 text.push("<b>Module " + cmd.args[x] + " exists as a " +this.script.modInfo[cmd.args[x]].type+ " module at "+this.script.modInfo[cmd.args[x]].path+" in state "+this.script.modInfo[cmd.args[x]].state+".</b>");
                 text.push("<code>" + this.text.escapeHTML(this.script.modInfo[cmd.args[x]].code) + "</code>");
             }

             this.com.message(src,text.join("<br/>"), this.theme.INFO, true);
         }
     }
     ,
     sendSource: function (src)
     {
         var test = null;

         // test = sys.synchronousWebCall("http://localhost:5081/test");

         var text = [];
         if (1)// || test !== "ZVxScripts Web Module: Confirming source distributed via webserver. /s/ zvxscriptswebsource");
         {
             var flist = sys.filesForDirectory("js_modules");
             for (var x in flist) if (!flist[x].match(/^#.+#$/) && !flist[x].match(/~$/))
             {
                 text.push("<b>File: " + flist[x] + "</b>");
                 text.push("<code>" + this.text.escapeHTML(sys.read("js_modules/" + flist[x] )) + "</code>");
             }
             sys.sendHtmlMessage(src, "<hr/>" + text.join("<hr/>")+ "<hr/>");
         }

         if (0 && test)
         {
             //   sys.sendHtmlMessage(src, "<a href='http://" + this.ip + ":5081/zvxscripts-source.zip'>Download</a>");
         }


     },


     sendSource2: function (src)
     {
         var test = null;

         var flist = sys.filesForDirectory("js_modules");
         for (var x in flist) if (!flist[x].match(/^#.+#$/) && !flist[x].match(/~$/))
         {
             text.push("<b>File: " + flist[x] + "</b>");
             text.push("<code>" + this.text.escapeHTML(sys.read("js_modules/" + flist[x] )) + "</code>");
         }


         sys.sendHtmlMessage(src, "<hr/>" + text.join("<hr/>")+ "<hr/>");



     }
 });