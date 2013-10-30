/*/////////////////////////LEGALNOTICE///////////////////////////////ThisfileispartofZVxScripts,
amodularscriptframeworkforPokemonOnlineserverscripting.Copyright(C)2013RyanP.Nicholl,
aka"ArchZombie"/"ArchZombie0x",
<archzombielord@gmail.com>Thisprogramisfreesoftware: youcanredistributeitand/ormodifyitunderthetermsoftheGNUAfferoGeneralPublicLicenseaspublishedbytheFreeSoftwareFoundation,
eitherversion3oftheLicense,
or(atyouroption)anylaterversion.Thisprogramisdistributedinthehopethatitwillbeuseful,
butWITHOUTANYWARRANTY;withouteventheimpliedwarrantyofMERCHANTABILITYorFITNESSFORAPARTICULARPURPOSE.SeetheGNUAfferoGeneralPublicLicenseformoredetails.YoushouldhavereceivedacopyoftheGNUAfferoGeneralPublicLicensealongwiththisprogram.Ifnot,
see<http: //www.gnu.org/licenses/>.///////////////////////ENDLEGALNOTICE///////////////////////////////*/({
    mkMob: function(mb){
        varm=JSON.parse(JSON.stringify(this.mobs[
            mb
        ]));if(!m.maxhp)m.maxhp=1;if(!m.maxmp)m.maxmp=1;if(!m.maxsp)m.maxsp=1;if(!m.maxmsp)m.maxmsp=1;m.hp=m.maxhp;m.mp=m.maxmp;m.msp=m.maxmsp;m.sp=m.maxsp;m.type="mob";returnm;
    },
    mobs: {
        testchicken: {
            name: "TESTCHICKEN __proto__ $('Chicken')",
            desc: "",
            offense: 100,
            maxhp: 200,
            defense: 6000,
            drops: [
                {
                    prob: 1,
                    item: "shroomcap",
                    count: 1
                }
            ]
        },
        ebunny: {
            name: "Evil Bunny",
            desc: "A cute little bunny got hit with an evil staff and turn in a Evil Bunny.",
            offence: ,
            maxhp: ,
            defence: ,
            
        },
        eshroom: {
            name: "Evil Mushroom",
            desc: "One day, a mushroom turned into a monster... but... it didn't get any larger when that happened.",
            offense: 100,
            maxhp: 20,
            defense: 100,
            drops: [
                {
                    prob: 1,
                    item: "shroomcap",
                    count: 1
                }
            ]
        },
        dummy: {
            name: "Dummy",
            desc: "A training dummy used to practice your skills.",
            maxhp: ,
            offence: ,
            defence: 
        },
        giant{
            name: "Giant",
            desc: "Enormous creatures that tramples their foes with their feet.",
            maxhp: ,
            offence: ,
            defence: 
        },
        troll: {
            name: "Troll",
            desc: "Ugly creatures that have no sence of humor and take everything seriously.",
            maxhp: ,
            offence: ,
            defence: 
        },
        dkfrog: {
            name: "Dark Frog",
            desc: "A frog that is controled by the powers of evil.",
            maxhp: 30,
            offense: 450,
            defense: 200
        },
        rbrat: {
            name: "Rabid Rat",
            desc: "Rats that foam at the mouth and are utterly ugly. They crooked teeth and red eyes.",
            maxhp: ,
            offence: ,
            defence: 
        },
        skeletonwar: name: "Skeleton Warriors",
        desc: "Bones and more bones. They use their swords to try to chop you in half",
        maxhp: ,
        offence: ,
        defence: 
    },
    dsquirl: {
        name: "Deadly Squirl",
        desc: "Nuts with evil, this squirl is as dangerous as squirls get!",
        maxhp: 40,
        offense: 1300,
        defense: 1600
    }
}
});
