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
(function () {
     return {
         require: ["commands", "security",  "com", "theme", "time", "logs", "text", "util", "user"]
         ,
         filters: []
         ,
         capture: new Object
         ,
         registerCapture: function (src, func, object)
         {
             if (!this.capture[src]) this.capture[src] = [];

             var capper = this.util.bind(object, func);

             this.capture[src].push(capper);
             object.onUnloadModule( this.util.bind(
                                        this,
                                        function ()
                                        {
                                            this.filters.splice(this.filters.indexOf(capper), 1);
                                        }
                                    ));

         },


         beforeChatMessage: function beforeChatMessage (src, msg, chan)
         {
             if (msg.length == 0) return;

             if (this.capture[src] && this.capture[src].length >= 1)
             {
                 sys.stopEvent();
                 var f = this.capture[src].pop();

                 f.call(new Object, src, msg, chan);

                 return;
             }

             if (msg[0] == "/")
             {

                 sys.stopEvent();
                 this.commands.issueCommand(src, msg, chan);
                 return;
             }

             else if (! this.user.hasPerm(src, "CHAT"))
             {
                 sys.stopEvent();
                 this.com.message(src, "Permission denied.", this.theme.WARN);
                 return;
             }

             if (chan == -1 && src != 0)
             {
                 sys.stopEvent();
                 return;
                 // can't write outside of all channels here >_<
             }


             var muteID = this.security.muteID(src);

             if (muteID !== null && !this.user.hasPerm(src, "PROTECTED") )
             {
                 var mute = this.security.database.mutes[this.security.muteID(src)];

                 this.com.message(
                     [src],
                     "<hr/>You are muted.<br>" + this.theme.issuehtml(mute) + "<hr/>",
                     this.theme.CRITICAL,
                     true
                 );

                 this.logs.logMessage(this.logs.INFO, "Muted message from "+sys.name(src)+": " + msg);
                 sys.stopEvent();

                 return;
             }

             var m = msg;

             for (var x in this.filters)
             {
                 m = this.filters[x](src, msg, chan);

                 if (!m) break;
             }

             if (m)
             {
                 sys.broadcast(m, chan, src, false, -1);
                 this.logs.logMessage(this.logs.CHAT, (chan == -1? "" : "[#"+sys.channel(chan)+"] ") + sys.name(src) + ": " + msg);
             }
             sys.stopEvent();

         }
         ,
         registerFilter: function (filter, object)
         {
             var filt = this.util.bind(object, filter);
             this.filters.push(filt);
             object.onUnloadModule( this.util.bind(
                                        this,
                                        function ()
                                        {
                                            this.filters.splice(this.filters.indexOf(filt), 1);
                                        }
                                    ));
         }
         ,
         loadModule: function loadModule ()
         {
             this.script.registerHandler("beforeChatMessage", this);
         }
     };})();
