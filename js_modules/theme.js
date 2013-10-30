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
     require: ["text", "time"],
     hotswap: true,

     INFO: 0,
     WARN: 1,
     CRITICAL: 2,
     GAME: 3,
     TOUR: 4,
     LOG: 5,


     TEMPLATE1: "<span style='color:%1;'><timestamp /><b>~Script~:</b></span> %2",
     TEMPLATE2: "<span style='color:%1;'><timestamp /><b>~Script~:</b> %2</span>",


     formatAs: function (text, type)
     {
         switch (type)
         {
         case this.INFO:
             return this.TEMPLATE1.replace(/%1/g, "blue").replace(/%2/, text);

         case this.WARN:
             return this.TEMPLATE1.replace(/%1/g, "red").replace(/%2/, text);

         case this.CRITICAL:
             return this.TEMPLATE2.replace(/%1/g, "red").replace(/%2/, text);

         case this.GAME:
             return this.TEMPLATE1.replace(/%1/g, "green").replace(/%2/, text);

         case this.TOUR:
             return this.TEMPLATE2.replace(/%1/g, "green").replace(/%2/, text);

         case this.LOG:
             return this.TEMPLATE2.replace(/%1/g, "grey").replace(/%2/, text);


         default:
             return text;
         }
     },

     issuetext: function (issued)
     {
         var outtext = [];
         function out(prop, propname)
         {
             if (issued[prop] && issued[prop].length)
             {
                 outtext.push(propname + ": " + issued[prop].join(", ") + ".");
             }
         }

         if (issued.author) outtext.push("Issued by: " + issued.author);
         if (issued.reason) outtext.push("Reason: " + issued.reason);

         outtext.push("Expires: " + ( issued.expires?  this.time.diffToStr(issued.expires - +new Date) + " (" +  new Date(issued.expires).toString() +")" : "indefinite"));


         out.call(this, "names", "Names");
         out.call(this, "ips", "IPs");
         out.call(this, "subnets", "IP Subnets");
         out.call(this, "nameRegex", "Regular Expressions");

         out.call(this, "hostnames", "Hostname Regular Expression(s)");

         return outtext.join("\n");

     },



     issuehtml: function (issued)
     {
         var outtext = [];
         function out(prop, propname)
         {
             if (issued[prop] && issued[prop].length)
             {
                 outtext.push("<b>"+  propname + "</b>: " + this.text.escapeHTML(issued[prop].join(", ")) + ".");
             }
         }


         if (issued.author) outtext.push("<b>Issued by:</b> " + issued.author);
         if (issued.reason) outtext.push("<b>Reason:</b> " + issued.reason);

         outtext.push("<b>Expires:</b> " + ( issued.expires?  this.time.diffToStr(issued.expires - +new Date) + " (" +  new Date(issued.expires).toString() +")" : "indefinite"));

         out.call(this, "names", "Name(s)");
         out.call(this, "ips", "IP(s)");
         out.call(this, "subnets", "IP Subnet(s)");
         out.call(this, "nameRegex", "Regular Expression(s)");
         out.call(this, "hostnames", "Hostname Regular Expression(s)");

         return outtext.join("<br/>");

     }


 });
