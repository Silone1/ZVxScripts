({
     require: ["commands", "user"],


     groupmod:
     {
         server: true,

         perm: function (src, cmd, chan)
         {
             return "USERMOD" in this.user.groups(src);
         },

         code: function (src, cmd, chan)
         {
             var x;

             var groups = this.user.groups(src);

             if (!cmd.flags.group)
             {
                 this.com.message(src, "Include a --group=<group> option.", this.theme.WARN);
                 return;
             }

             if (cmd.flags.add && !cmd.flags.drop)
             {
                 if (!(("GROUPMOD[" + cmd.flags.group + "]") in groups || "SERVEROP" in groups))
                 {
                     this.com.message(src, "You don't have permission to manage that group.");
                     return;
                 }

                 for (x in cmd.args)
                 {
                     if (sys.dbRegistered(cmd.args[x]))
                     {
                         this.user.database.usergroups[cmd.args[x]] = this.user.database.usergroups[cmd.args[x]] || [];

                         var a = this.user.database.groups[cmd.args[x]];

                         if (a.indexOf(cmd.flags.group) === -1)
                         {
                             a.push(cmd.flags.group);
                             this.com.broadcast(this.user.name(src) + " set " +  cmd.flags.group  + " for " + cmd.args[x] + ".", this.theme.INFO);
                         }
                         else
                         {
                             this.com.message(src, "User is already in that group.");
                         }
                     } else this.com.message(src, "Unregistered users are uneligible for group membership.", this.theme.WARN);
                 }
             }
             else if (!cmd.flags.add && cmd.flags.drop)
             {
                 if (!(("GROUPMOD[" + cmd.flags.group + "]") in groups || "SERVEROP" in groups))
                 {
                     this.com.message(src, "You don't have permission to manage that group.", this.theme.WARN);
                     return;
                 }

                 for (x in cmd.args)
                 {
                     if (sys.dbRegistered(cmd.args[x]))
                     {
                         this.user.database.usergroups[cmd.args[x]] = this.user.database.usergroups[cmd.args[x]] || [];

                         var a = this.user.database.groups[cmd.args[x]];

                         if (a.indexOf(cmd.flags.group) !== -1)
                         {
                             a.splce(a.indexOf(cmd.flags.group), 1);
                             this.com.broadcast(this.user.name(src) + " removed " +  cmd.flags.group  + " for " + cmd.args[x] + ".", this.theme.INFO);
                         }
                         else
                         {
                             this.com.message(src, "User is not in that group.", this.theme.WARN);
                         }
                     } else this.com.message(src, "Unregistered users are uneligible for group membership.", this.theme.WARN);
                 }
             }
         }
     }
 });