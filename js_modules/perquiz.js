({
     require: ["commands", "theme", "com", "chat", "user"],

     ADV:
     {
         // Primary Dual Types Ne

         // Prime
         "ne/ti": ["eN/T", "The Inventor", "Stereotyped as the 'Mad Scientist', the eN/T is the best idea generator. Equivalent to ENTP in MBTI."],
         "ne/fi": ["eN/F", "The Journalist", "eN/Fs are compelled to make the world a better place, and to affect the opinions of those around them. MBTI ENFP."],
         "ne/si": ["eN/S", "The Pioneer", "Focused on doing what they love, and being good at it, the eN/S focuses on preception."],

         // Conflicting
         "ne/ni": ["eN*", "The Idea Machine", "The eN/N has too many ideas. They need to take a BREAK FROM THINKING AND GO FOR A WALK." ],

         // Artificial
         "ne/te": ["E+NT", "The Insane Dictator", "The E+NT is OVERLY ENTHUSIATIC, and sells their ideas HARD AND FORCEFULLY."],
         "ne/fe": ["E+NF", "The Dreamy Empath", "The E+NF might be preoccupied with some social ideal, with no focus on themselves."],
         "ne/se": ["E+NS", "The ADD Manic", "Please don't get me started."],

         // Primary Dual Types Ni

         "ni/te": ["iN/T", "The Scientist", null],
         "ni/fe": ["iN/F", "The Psychologist", null],
         "ni/se": ["iN/S", "The Strategist", null],


         "ni/ne": ["iN*", "The Psychic Theorist", "Completely lost in their heads, the iN/N loves all things theoretical. Particularly capable at predicting all the possibles courses of events and reacting to them."],


         "ni/ti": ["I+NT", "The Schizofrenic", null],
         "ni/fi": ["I+NF", "The Psychotic Strategist", null],
         "ni/si": ["I+NS", "The Autistic Thinker", null],


         // SE

         "se/fi": ["eS/F", "The Fun One", null],
         "se/ti": ["eS/T", "The Doer", null],
         "se/ni": ["eS/N", "The Tactician", null],

         "se/si": ["eS*", "The Practicioner", null],

         "se/fe": ["E+SF", "The, HyyyperacTIVE!1!!1one!", null],
         "se/te": ["E+ST", "The Draconian Madman", null],
         "se/ne": ["E+SN", "The ADHD Nut", null],


         // Si

         "si/fe": ["iS/F", "The Law Enforcement", null],
         "si/te": ["iS/T", "The Coffee Lover", null],
         "si/ne": ["iS/N", "The Suggestor", null],

         "si/se": ["iS*", "The Detailer", null],

         "si/ti": ["I+ST", "The Paranoid One", null],
         "si/fi": ["I+SF", "The Sentimentalist", null],

         // Primary Dual Types Ti

         "ti/ne": ["iT/N", "The Architect", null],
         "ti/fe": ["iT/F", "The Social Engineer", null],
         "ti/se": ["iT/S", "The Craftsman", null],

         "ti/te": ["iT*", "The Empricist", null],

         "ti/ni": ["I+TN", "The Schizoid", null],
         "ti/fi": ["I+TF", "The Inquizitor", null],
         "ti/si": ["I+TS", "The Knowledge Keeper", null],


         // FI
         "fi/ne": ["iF/N", "The Idealist", null],
         "fi/te": ["iF/T", "The Moral Order Enforcer", null],
         "fi/se": ["iF/S", "The Artist", null],

         "fi/fe": ["iF*", "The Rather Emotional", null],

         "fi/ni": ["I+TN", "The Insane Doomsay Prepper", null],
         "fi/ti": ["I+TF", "The Delusional Idealist", null],
         "fi/si": ["I+TS", "The Scarred", null],

         // TE

         "te/ni": ["eT/N", "The Executive", null],
         "te/si": ["eT/S", "The Administrator", null],
         "te/fi": ["eT/F", "The Extremist Nut", null],

         "te/ti": ["eT*", "The Judge", null],

         "te/fe": ["E+TF", "The Harmonizer", null],
         "te/ne": ["E+TN", "The Juggernaut", null],
         "te/se": ["E+TS", "The Opportunist", null],

         // FE

         "fe/ti": ["eF/T", "The Merry One", null],
         "fe/si": ["eF/S", "The Guardian", null],
         "fe/ni": ["eF/N", "The Counselor", null],

         "fe/fi": ["eF*", "The Empath", null],

         "fe/te": ["E+FT", "The Cult Master", null],
         "fe/ne": ["E+FN", "The Bubbly One", null],
         "fe/se": ["E+FS", "The Initiator", null],



     },

     loadModule: function ()
     {
         this.commands.registerCommand("perquiz", this);
     },
     perquiz:
     {
         server: false,

         desc: "Take a free personality quiz!",

         perm: function () {return true;},

         code: function (src, cmd, chan)
         {
             var i = 0;

             var bind = this;

             var quizObj = {};

             var answers = [];

             function answerQ (src, value, chan)
             {
                 if (value == "exit")
                 {
                     bind.com.message(src, "Exited quiz");
                 }

                 var num = +value;

                 if (num < -5)
                 {
                     bind.com.warn(src, "Input invlalid, treating as -5");
                     num = -5;
                 }

                 if (num > 5) num = 5;

                 if (! (num > 2 || num < 4)) num = 0;

                 var elm = bind.QUIZ[i][1];

                 if (!quizObj[elm]) quizObj[elm] = 0;

                 quizObj[elm] += num;
                 answers.push([i, sys.sha1(bind.QUIZ[i][0]), num]);

                 i++;
                 if (i >= bind.QUIZ.length)
                 {
                     endQ();

                     return;
                 }

                 else nextQ();
             }

             function nextQ ()
             {


                 bind.com.message(src, bind.QUIZ[i][0], bind.theme.GAME);

                 bind.chat.registerCapture(src, answerQ, bind);


             }

             function endQ()
             {
                 var type = new Array(4);

                 type[0] = (quizObj.ti + quizObj.fi + quizObj.si + quizObj.ni > quizObj.te + quizObj.fe + quizObj.ne + quizObj.se ? "I":"E");
                 type[1] = (quizObj.ni + quizObj.ne > quizObj.si + quizObj.se ? "N":"S");
                 type[2] = (quizObj.ti + quizObj.te > quizObj.fe + quizObj.fi ? "T":"F");
                 type[3] = (quizObj.ti + quizObj.fi + quizObj.ne + quizObj.se > quizObj.te + quizObj.fe + quizObj.ni + quizObj.si ? "P":"J");

                 // Now find Adva+ Type

                 var types = [["fe", quizObj.fe], ["fi", quizObj.fi], ["te", quizObj.te], ["ti", quizObj.ti], ["ne", quizObj.ne], ["ni", quizObj.ni], ["si", quizObj.si], ["se", quizObj.se]];

                 types.sort(function(a, b)
                            {
                                return b[1] - a[1];
                            });

                 var adva = bind.ADV[types[0][0] + "/" + types[1][0]][0]+" - " + bind.ADV[types[0][0] + "/" + types[1][0]][1];



                 bind.com.broadcast(bind.user.name(src) + " got this personality result!: MBTI: " + type.join("") + ", Adva+: "+adva+"!", bind.theme.GAME);

                 sys.append("perquiz.log", JSON.stringify([bind.user.name(src), sys.ip(src), answers, type]));
             }


             this.com.message(src, "Free MBTI-like personality type quiz! Simply type your responce into the chatbox, after you have answered all the questions your answers will be analyzed and the result shared with others in the chat! Have fun! (To quit, type 'exit')", bind.theme.GAME);

             nextQ();
         }

     },

     QUIZ:
     [
         ["On a scale: -5 (Aloof and distant) to 5 (Aware of your surroundings) you are:", "se"],
         ["On a scale: -5 (Often forget where things are) to 5 (Always remember where you put things) you are:", "si"],
         ["On a scale: -5 (Oblivious to unusual, clever solutions that may exist) to 5 (See all the various unusual ways things could be done) you are:", "ne"],
         ["On a scale: -5 (Unable to predict the future) to 5 (Aware of the future) you are:", "ni"],
         ["On a scale: -5 (Oblivious to the underlying mechanisms of reality) to 5 (Easily understand the rules and laws which objects and things operate under) you are:", "ti"],
         ["On a scale: -5 (Unconcerned with structure) to 5 (Structured, goal-oriented and effective) you are:", "te"],
         ["On a scale: -5 (Unable to read the emotional atmosphere) to 5 (Able to emphasize easily) you are:", "fe"],
         ["On a scale: -5 (Unprone to sympathy and moral laws) to 5 (Easily sympatsize with others, value morality) you are:", "fi"],
         ["On a scale: -5 (Not at all) to 5 (I feel trapped in life, I always want to rush to the next thing to do, create, thing to learn or project to start. I get bored easily and learn quickly) you are:", "ne"],
         ["On a scale: -5 (Not at all) to 5 (I have unusual dreams or symbolic image preceptions that give me insight into the true workings or reality or my goals) you are:", "ni"],
         ["On a scale: -5 (Not at all) to 5 (I feel energized, like power flows through my blood. I see things that are real with the greatest clarity, aware of everything around me.) you are:", "se"],
         ["On a scale: -5 (Not at all) to 5 (Everything has a value, one or the other. I act to keep things of value preserved and protected. Traditions, structures, family and comfort are all important to me) you are:", "si"],
         ["On a scale: -5 (Not at all) to 5 (Always evaluating things based on what their real value is) you are:", "te"],
         ["On a scale: -5 (Not at all) to 5 (Seek to understand the most complicated truths which escape preception of the common minds) you are:", "ti"],
         ["On a scale: -5 (Not at all) to 5 (Always concerned with other people's opinions and input, always coopertive) you are:", "fe"],
         ["On a scale: -5 (Not at all) to 5 (Guided by an inate sense of right and wrong, good an evil) you are:", "fi"],
         ["On a scale: -5 (Neither or not both) to 5 (Both very aware of my surroundings and always having new ideas) you are:", "ne/se-contra"],
         ["On a scale: -5 (Neither or not both) to 5 (Both very conerned with notions of absolute truth and concerned with morality) you are:", "ti/fi-contra"],
         ["On a scale: -5 (Neither or not both) to 5 (Both very evaluating, logical, concerned with efficiency, and coopertive, concerned with people's input and opinions) you are:", "te/fe-contra"],
         ["On a scale: -5 (Neither or not both) to 5 (Both very concerned with the possible future and destiny of humanity and concerned with the traditions, structures, and past) you are:", "ni/si-contra"]

     ]
 });
