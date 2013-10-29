#zvxscripts

Copyright 2013 "ArchZombie0x" Ryan P. Nicholl <archzombielord@gmail.com>

License for all the files is the GNU AGPLv3+

Suggested install method:

> Symlink all files here to the same folder as the server.
  Then doing git pull will update the scripts on your server. :)


ZVxScripts User Manual

Installing the Scripts

  The install.sh shell script might be useful. If you do not have 
  bash, the script can be installed manually like this:

1. Copy the js_modules folder to the server.

2. Copy the scripts.js file to the server.

3. Copy the COPYING file to the server, and rename it 
  ZVXSCRIPTS_COPYING

4. Create a directory/folder, called js_databases .

Permission Configuration

  WARNING: The auth changing commands in the players menu do not 
  always work. Use /setauth instead.

  You will probably want to set your administrator account to be 
  in the ServerOperator group. This is a group created by default 
  by the scripts when no groups exist. Type the following into 
  the server console:

/usermod "your username goes here" --group=ServerOperator --add

  To add Owners, type:

/setauth "username" --level=3

  Which is an easy way to add users to the Owner group.

  Keep in mind that the default configuration for the owner group 
  does not have a lot of permissions! If you want to give members 
  of the Owner group all permissions, type:

/groupmod --group=Owner --addperms=ALLPERMS

  You can add more groups with the create option:

/groupmod --create --group=MiniMod --addperms=MUTE,KICK

Using the scripts

1 Command parser style

  You can select between the simple or optargs command parser. 
  The default and the one used in the examples is optargs. Some 
  users may find simple easier. To change the parser mode for 
  your account, register, then type:

/userconf commandParser = "simple"

  OR

/userconf commandParser = "optargs"

  userconf is an example of a parser neutral command, as it 
  implements it's own parser, the above will always work.

  Here are some comparisons:

  optargs:

/ban "noob with spaces" 212.23.276.0/24 -time="4 hours" 
-reason=spamming

  simple:

/ban noob with spaces*212.23.276.0/24:time=4 
hours:reason=spamming



2 /commands

  Use "/commands" or "/commands --all" to get a list of commands. 
  It has fairly complete information and always lists every 
  command that's relevant, but is rather brief. You may use 
  /commands --examples as well, or --examples --all etc.

3 /help

  Try /help <command> for more information about it.

4 /modprobe

  /modprobe will help you manage LSMs (loadable script modules.) 
  By default, it will list loaded modules. If you include modules 
  as arguments, it will list information about that module.

  /modprobe has a few options as well:

  load Loads modules

  reload Loads modules, if they were already loaded then unloads 
  them first.

  unload Removes modules

5 /ioctrl

  /ioctrl provides you with a critical command to manage the 
  script databases in a simple and straightforward manner. By 
  default it lists the databases open. You also have a few 
  options to apply to open databases:

  all Changes the selected databases to include all databases, 
  not just the ones you listed manually.

  commit Commits all database changes to file.

  sync Synchronizes all databases to file. Basically the same as 
  commit except this writes the whole database, not just changes. 
  Will merge all commits into the database.

  backup Makes a copy of the entire database and writes it to a 
  file.

  purge Delete database.

  Note that databases automatically commit data every once in a 
  while and synchronize at open and close, by default.

6 /eval

  Used by nearly every script admin. This allows you run 
  arbitrary code on the server.

7 Security Commands

7.1 /ban 

  Ban player names, ip addresses, subnets, or regular expressions 
  from the server.

7.1.1 Options

  reason Specify a reason for the ban.

  time Specify a duration for the ban.

  silent Might not show a message.

  ip For all listed usernames, ban their IP address also.

7.2 /mute 

  Mute player names, ip addresses, subnets, or regular 
  expressions in the server.

7.2.1 Options

  reason Specify a reason for the mute.

  time Specify a duration for the mute.

  silent Might not show a message.

  ip For all listed usernames, ban their IP address also.

7.3 /info

  Most users can use info in the default configuration, as long 
  as they are registered. But it provides extra information to 
  moderators, such as the users IP address. Just type /info 
  <username>.

