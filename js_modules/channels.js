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
/** Implements channels
 * @name channels
 * @memberOf script.modules
 * @namespace
 * */
/** @scope script.modules.channels */
({
    require: ["io", "user"]
    ,
    /** The chans property stores channel databases */
    chans: null
    ,
    /** ChanDB keeps track of the file names of channel databases */
    chanDB: null
    ,
    loadModule: function ()
    {
        this.chanDB = this.io.openDB("channels");
        this.chans = new Object;
        this.chanDB.counter || (this.chanDB.counter = 0);
        this.chanDB.chans || (this.chanDB.chans = 0);
    }
    ,
    beforeChannelCreated: function (id, name, src)
    {
        var chanNameLw = sys.channel(id).toLowerCase();

        if (!this.chanDB.chans[chanNameLw])
        {
            this.chanDB.chans[chanNameLw] = this.chanDB.counter++;
            this.io.markDB("channels");
        }

        var chanID = this.chanDB.chans[chanNameLw];

        var cdb = this.chans[chanid] || this.io.openDB("chanels$c" + chanid);

        this.chans[name.toLowerCase()] = cdb;

        if (cdb.banned)
        {
            sys.stopEvent();
            return;
        }


        cdb.owner = this.user.name(src).toLowerCase();

        cdb.auth = new Object;
        cdb.bans = new Object;
        cdb.auth = new Object;

        cdb.auth[cdb.owner] = 3;

        cdb.motd = null;
    }
    ,
    channelObj: function(chan)
    {
        var chanNameLw = sys.channel(id).toLowerCase();

        if (!this.chanDB.chans[chanNameLw])
        {
            this.chanDB.chans[chanNameLw] = this.chanDB.counter++;
            this.io.markDB("channels");
        }

        var chanid = this.chanDB.chans[chanNameLw];

        var cdb = this.chans[chanid] || this.io.openDB("chanels$c" + chanid);

        return cdb;
    }
    ,
    afterChannelDestroyed: function (chan)
    {
        this.io.closeDB(sys.channel(chan).toLowerCase());

        delete this.chans[sys.channel(chan).toLowerCase()];
    }
});
