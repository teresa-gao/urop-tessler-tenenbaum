// TL;DR OVERVIEW OF experiment.js FILE:
// * Variable declarations — Much of the experiment can be modified solely by changing these variable values
// * Functions — These are used primarily in slides.trials (trials slide)
// * Slides — These include intro slide, catch trials, trial slides (including experimental and follow-up comprehension checks), optional demographic info, and thank-you (data submission to MTurk)
// * Setup — Here, we create the data frames which are passed as stim into slides.trials and/or used to collect data to be submitted to MTurk; declare exp.structure; and set up things such as Unique Turker

var total_trials_num =  1; // Number of trials, each with a unique background, agent, speaker, and exemplar, per participant

var back =              _.shuffle( [1,2,3,4,5,6,7,8,9,10] ); // Background images
var agents =            _.shuffle( ["Elephant","Pig","Monkey","Dog","Bear","Tiger","Cat","Sheep"] ); // Bunny, Beaver, Frog, and Mouse excluded due to difference from mean width, though they may be easily readded
var speakers =          _.shuffle( ["mh", "tg", "sb"] ); // Recorded speaker voices used; files are stored in xx_recordings directory, where xx are the initials of the speaker

var artifacts =         _.shuffle([ ["artifact", "artifact01", "squeaking"], ]);
var flowers =           _.shuffle([ ["flower", "flower01", "purple petals"] ]);
var birds =             _.shuffle([ ["bird", "bird02", "green feathers"] ]);
var objects =           _.shuffle([ artifacts[0], flowers[0], birds[0]]);

var item_name =         _.shuffle([ ["dax", "daxes"], ["fep", "feps"], ["blicket", "blickets"] ]);
var n_examples =        _.shuffle([1, 2]);
var item_presentation_condition = _.shuffle(["accidental", "naive", "pedagogical"]); // Formerly _.shuffle(["pedagogical", "accidental", "generic", "generic_text_only", "generic_no_visual", "gen+ped"]); see README for descriptions of each condition

// Used during followup checks to label checkbox grid options with correct answers + distractors
var correct_names = [];
var correct_properties = [];
let counter;
for (counter=0; counter<total_trials_num; counter++) {
    correct_names.push(item_name[counter][0]);
    correct_properties.push(objects[counter][2]);
};
correct_names = correct_names.sort();

var grid_name_labels = _.shuffle($.merge(correct_names.slice(), ["krim", "shen", "thoop", "glud", "zobby", "vug", "glabbin", "yeph"]));
var grid_property_labels = _.shuffle($.merge(correct_properties.slice(), ["blue claws", "orange wings", "yellow leaves", "red thorns", "buzzing", "whistling"]));

// Returns whether the contents of two list Objects are equal; pulled from gomakethings.com
function list_content_equals(arr1, arr2) {

    // Check if the arrays are the same length
    if (arr1.length !== arr2.length) return false;

    // Check if all items exist and are in the same order
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }

    // Otherwise, return true
    return true;
};

// Changes all elements of an HTML class to have the same source image; used for stimuli objects
function change_image(class_name, source) {
    changing_images = document.getElementsByClassName(class_name);
    for (var i=0; i<changing_images.length; i+=1) {
        changing_images[i].src = source;
    }
}

// Displays straight-facing agent with given agent class name
function agent_straight(agent_class) {
    $(".agent").hide();
    $("."+agent_class+"_straight").show();
}

// Displays right-pointing agent with given agent class name
function agent_point_r(agent_class) {
    $(".agent").hide();
    $("."+agent_class+"_point_r").show();
}

// Agent faces right and slides forward and back; used to interact with exemplars
function agent_poke_r(agent_class) {

    let deferred = new $.Deferred();

    $(".speech").hide();

    // Agent faces right
    agent_point_r(agent_class);

    // Agent slides right
    $("."+agent_class+"_point_r").animate(
        { right: "-=30px"},
        { duration: 300}
    );

    // Agent returns to original position
    $("."+agent_class+"_point_r").animate(
        { right: "+=30px"},
        { duration: 300}
    );

    setTimeout (function() {
        deferred.resolve();
    }, 600);

    return deferred.promise();
}

// Agent says text (i.e., text is displayed in speech bubble) and text is logged to data to be sent to MTurk
function agent_say(display_text, trial_num, duration=2000) {

    let deferred = new $.Deferred();

    // Display text in speech bubble
    $(".speech").show();
    $(".speech-bubble").text(display_text);

    // Logs spoken text to trials_stimuli_full (to be sent to MTurk)
    exp.trials_stimuli_full[trial_num]["spoken_text"].push(
        {
            display_text: display_text,
            duration: duration
        }
    );

    setTimeout (function() {
        deferred.resolve();
    }, duration);

    return deferred.promise();
}

// Displays correct number of objects, blankets, and tags on table
function set_table(stim, show_blankets_up) {

    // Displays objects, blankets, and tags
    let counter;
    for (counter = 1; counter <= stim.n_examples; counter++) {
        change_image("closed", "images/" + stim.object[1] + "_closed.svg");
        change_image("open", "images/" + stim.object[1] + "_open.svg");

        $(".object" + counter + ".closed").show();
        if (show_blankets_up) {
            $(".blanket" + counter + ".blanket_up").show();
        } else {
            $(".blanket" + counter + ".blanket_down").show();
        }

        $(".label" + counter).show();
        $(".label" + counter).text(stim.item_name[0].toUpperCase());
    };

    // Adjusts object display location based on stimulus
    $(".object1").css("right", "275px");
    $(".object2").css("right", "202px");
    $(".object3").css("right", "129px");
    $(".object4").css("right", "56px");
    $(".object").css("height", "85.5px");
    $(".object").css("width", "auto");
}

// Agent pokes current exemplar, and the blanket covering falls off, revealing the object underneath
function poke_blanket_fall(stim) {

    let deferred = new $.Deferred();

    // Agent prods line of object(s)
    agent_poke_r(stim.agent).then(

        // Blanket drops
        function() {

            let counter = stim.exemplar_num;

            $(".label" + counter).fadeOut(600);
            $(".blanket" + counter + ".blanket_up").fadeOut(600);
            $(".blanket" + counter + ".blanket_down").fadeIn(600);

        }
    )

    setTimeout (function() {
        deferred.resolve();
    }, 1000);

    return deferred.promise();
}

// Exemplar object "opens" and displays its property
function effect(stim) {

    let deferred = new $.Deferred();

    if (stim.object[0] == "artifact") {

        // Squeaking sound plays
        squeak = new Audio("audio/squeak.mp3");
        squeak.play();

        // Object squishes!
        $(".object" + stim.exemplar_num).animate(
            { height: "-=10px", width: "+=0px"},
            { duration: 300}
        );
        $(".object" + stim.exemplar_num).animate(
            { height: "+=10px", width: "+=0px"},
            { duration: 300}
        );

    } else {

        // "Open" object property revealed
        if (stim.object[0] == "bird") {
            // Bird chirp sound
            property_sound = new Audio("audio/bird_chirp.mp3");

        } else if (stim.object[0] == "flower") {
            // Upward glissando
            property_sound = new Audio("audio/gliss_up.mp3");
        }

        // Sound plays
        property_sound.play();

        // Object image fades from its open to closed version
        $(".object" + stim.exemplar_num + ".closed").fadeOut(600);
        $(".object" + stim.exemplar_num + ".open").fadeIn(600);

    }

    setTimeout (function() {
        deferred.resolve();
    }, 1000);

    return deferred.promise();
}

// Exemplar displays property, agent remarks on property, and exemplar returns to "closed" position
function effect_remark_close(stim) {

    // Exemplar object "opens" and displays its property
    effect(stim).then(

        // Agent remarks on "open" object property
        function() {


            let deferred = new $.Deferred();

            // Agent faces front
            agent_straight(stim.agent);

            let delay_time = 3000;
            let audio_file_name = "see_";

            let say_text = "See? ";
            if ((stim.item_presentation_condition == "accidental") || (stim.item_presentation_condition == "naive")) {
                say_text = "Oh wow! ";
                audio_file_name = "wow_";
                delay_time += 500;
            }

            if (stim.object[0] == "artifact") {
                say_text += "Squeaking!";
                audio_file_name += "squeaking";
                delay_time -= 500;
            } else {
                say_text += stim.object[2].charAt(0).toUpperCase() + stim.object[2].slice(1) + "!";
                if (stim.object[2] == "purple petals") {
                    audio_file_name += "purple_petals";
                } else if (stim.object[2] == "green feathers") {
                    audio_file_name += "green_feathers";
                }
            }

            // Agent remarks on object

            remark = new Audio("audio/" + stim.speaker + "_recordings/" + audio_file_name + ".mp3");
            remark.play();

            agent_say(say_text, stim.trial_num, delay_time);

            setTimeout (function() {
                deferred.resolve();
            }, delay_time);

            return deferred.promise();
        }

    ).then(

        // Object resets to "closed"
        function() {


            let deferred = new $.Deferred();

            $(".speech").hide();

            let counter = stim.exemplar_num;
            $(".object" + counter + ".open").fadeOut(600);
            $(".object" + counter + ".closed").fadeIn(600);

            setTimeout (function() {
                deferred.resolve();
            }, 600);

            return deferred.promise();
        }

    ).then(

        // Continues to next slide within subtrial
        function() {
            $("#continue_button1").show();
        }
    );
}

// Full subtrial is run; combines above functions
function run_trial(stim, exp_this) {

    // Sets up initial display (sans objects, etc.)
    $("button, .grid, .object, .error, .speech, .slider, .mc, .blanket, .label, #freeform, #followup_title, #trials_text, #generic_text").hide();
    $(".container, .table, .background").show();

    // Agent greets user
    if (stim.type == "greeting") {

        // Display greeting setup (background, agent, visible speech bubble)
        agent_straight(stim.agent);
        change_image("background", "images/back" + stim.background + ".jpg");
        $(".speech-bubble").css("left", "10px");
        $(".speech-bubble-tail, .speech-bubble-outline").css("right", "475px");

        // Greeting text and audio
        let greeting = "Hello! I've been doing research on this planet for a while.";
        let hello = new Audio("audio/" + stim.speaker + "_recordings/hello_been_researching.mp3");;
        if ((stim.item_presentation_condition == "accidental") || (stim.item_presentation_condition == "naive")) {
            greeting = "Hello! I am a new researcher. I just arrived on this planet.";
            hello = new Audio("audio/" + stim.speaker + "_recordings/hello_new_researcher.mp3");
        }
        hello.play();

        agent_say(greeting, stim.trial_num, 4000).then(

            // Continue to next subtrial slide
            function() {
                $("#continue_button1").show();
            }

        );

    // Agent remarks on objects (number and name) on table
    } else if (stim.type == "on_the_table") {

        // Display objects on table
        set_table(stim, true);

        let on_the_table;
        let on_the_table_audio;
        let wait_time = 3500;

        // Create grammatically correct remark and fetch correct audio file
        if (stim.item_presentation_condition == "pedagogical") {
            if (stim.n_examples > 1) {
                on_the_table = "Here we have some " + stim.item_name[1] + " on the table.";
                on_the_table_audio = new Audio("audio/" + stim.speaker + "_recordings/here_" + stim.item_name[1] + ".mp3");
            } else {
                on_the_table = "Here we have a " + stim.item_name[0] + " on the table.";
                on_the_table_audio = new Audio("audio/" + stim.speaker + "_recordings/here_" + stim.item_name[0] + ".mp3");
            }
        } else if ((stim.item_presentation_condition == "accidental") || (stim.item_presentation_condition == "naive")) {
            on_the_table = "Hmm, I wonder what we have here on the table.";
            on_the_table_audio = new Audio("audio/" + stim.speaker + "_recordings/hmm_i_wonder.mp3");
        }
        on_the_table_audio.play()

        // Agent remarks on objects on the table
        agent_say(on_the_table, stim.trial_num, wait_time);

        setTimeout (function() {
            _stream.apply(exp_this);
        }, wait_time);

    } else if (stim.type == "oh_i_see") {

        // Display objects on table
        set_table(stim, true);

        let wait_time = 4000;
        let oh_i_see = "Oh, I see! These are " + stim.item_name[1] + ".";
        let oh_i_see_audio = new Audio("audio/" + stim.speaker + "_recordings/oh_" + stim.item_name[1] + ".mp3");;
        if (stim.n_examples == 1) {
            oh_i_see = "Oh, I see! This is a " + stim.item_name[0] + ".";
            oh_i_see_audio = new Audio("audio/" + stim.speaker + "_recordings/oh_" + stim.item_name[0] + ".mp3");
        }

        agent_say(oh_i_see, stim.trial_num, wait_time);
        oh_i_see_audio.play();
        setTimeout (function() {
            _stream.apply(exp_this);
        }, wait_time);

    } else if (stim.type == "agent_knowledge") {

        set_table(stim, true)
        let agent_knowledge = "I don't know anything about " + stim.item_name[1] + ".";;
        let knowledge_audio = new Audio("audio/" + stim.speaker + "_recordings/idk_" + stim.item_name[1] + ".mp3");

        if (stim.item_presentation_condition == "pedagogical") {
            agent_knowledge = "I know all about " + stim.item_name[1] + ".";
            knowledge_audio = new Audio("audio/" + stim.speaker + "_recordings/i_know_" + stim.item_name[1] + ".mp3");
        }

        knowledge_audio.play();

        let wait_time = 3000;
        agent_say(agent_knowledge, stim.trial_num, wait_time).then(
            function() {
                // Continues to next subtrial slide
                $("#continue_button1").show();
            }
        );


    // No visuals: only text (generic statement) is displayed
    } else if (stim.type == "text") {

        $(".agent, .object, .error, .speech, .blanket, .label, .table, .background, .slider, .continue_button, #freeform").hide();

        let generic_statement = stim.item_name[1][0].toUpperCase() + stim.item_name[1].slice(1) + " have " + stim.property;;
        if (stim.property == "squeaking") {
            generic_statement = stim.item_name[1][0].toUpperCase() + stim.item_name[1].slice(1) + " squeak";
        }

        $("#generic_text").text("\"" + generic_statement + ".\"");

        if (stim.trial_num == 1) {
            $("#trials_text").text("You come across a scientist. The scientist tells you:");
        } else {
            $("#trials_text").text("You come across another scientist. The scientist tells you:");
        }

        // Continue to next subtrial
        $("#trials_text, #generic_text, #continue_button1").show();

    // Agent gives generic statement — this is only for gen+ped, generic, and generic_no_visual conditions
    } else if (stim.type == "tell_you") {

        // Display objects on table
        set_table(stim, true);

        if (stim.item_presentation_condition == "generic_no_visual") {
            $(".object, .label, .blanket").hide();
        };

        let audio_timeout = 1500;

        // Create grammatically correct generic statement
        let property = stim.object[2];
        let say_text = ""
        let say_property;
        if (property == "squeaking") {
            say_text = stim.item_name[1][0].toUpperCase() + stim.item_name[1].slice(1) + " squeak.";
            say_property = new Audio("audio/" + stim.speaker + "_recordings/" + stim.item_name[1] + "_" + "squeak" + ".mp3");
        } else {
            say_text = stim.item_name[1][0].toUpperCase() + stim.item_name[1].slice(1) + " have " + property + ".";
            audio_timeout += 250;

            if (property == "purple petals") {
                say_property = new Audio("audio/" + stim.speaker + "_recordings/" + stim.item_name[1] + "_have_purple_petals.mp3");
            } else if (property == "green feathers") {
                say_property = new Audio("audio/" + stim.speaker + "_recordings/" + stim.item_name[1] + "_have_green_feathers.mp3");
            }
        }

        let something_to_tell = new Audio("audio/" + stim.speaker + "_recordings/i_have_something_to_tell_you.mp3");
        something_to_tell.play();
        agent_say("I have something to tell you.", stim.trial_num, 2000).then(

            function() {


                let deferred = new $.Deferred();

                // Agent says generic statement
                agent_say(say_text, stim.trial_num, 1500);
                say_property.play();

                setTimeout (function() {
                    deferred.resolve();
                }, audio_timeout);

                return deferred.promise();
            }

        ).then(

            // Continues to next subtrial slide
            function() {
                $("#continue_button1").show();
            }

        );

    // Trial
    } else if (stim.type == "trial") {

        // Display objects on table
        set_table(stim, true);

        if (stim.object[0] == "bird") {
            $(".object1.open").css("right", "219px");
            $(".object2.open").css("right", "146px");
            $(".object3.open").css("right", "73px");
            $(".object4.open").css("right", "0px");
        } else if (stim.object[0] == "flower") {
            $(".open").css("height", "95.5px");
        }

        // Previously shown objects are still displayed
        counter;
        for (counter=1; counter < stim.exemplar_num; counter++) {
            change_image("closed", "images/" + stim.object[1] + "_closed.svg");
            $(".blanket" + counter + ".blanket_up").hide();
            $(".blanket" + counter + ".blanket_down").show();
            $(".label" + counter).hide();
        };

        // Agent and speech bubble position adjust to active object
        let agent_right_val = (360 - (stim.exemplar_num - 1)*73) + "px";
        let speech_bubble_val = (10 + (stim.exemplar_num -1)*73) + "px";
        let speech_tail_val = (475 - (stim.exemplar_num - 1)*73) + "px";
        $("." + stim.agent + "_straight").css("right", agent_right_val);
        $("." + stim.agent + "_point_r").css("right", agent_right_val);
        $(".speech-bubble").css("left", speech_bubble_val);
        $(".speech-bubble-tail").css("right", speech_tail_val);
        $(".speech-bubble-outline").css("right", speech_tail_val);

        // Accidental item presentation
        if (stim.item_presentation_condition == "accidental") {

            poke_blanket_fall(stim).then(

                // Agent says "Oops!"
                function() {


                    let deferred = new $.Deferred();

                    agent_say("Oops!", stim.trial_num);
                    oops = new Audio("audio/" + stim.speaker + "_recordings/oops.mp3");
                    oops.play();

                    setTimeout (function() {
                        deferred.resolve();
                    }, 1000);

                    return deferred.promise();
                }

            ).then(

                // Speech bubble hides, object returns to "closed" position
                function() {
                    $(".speech").hide();
                    effect_remark_close(stim);
                }

            );

        // Naive item presentation
        } else if (stim.item_presentation_condition == "naive") {

            let say_text = "Let's take a look.";
            let lets_look = new Audio("audio/" + stim.speaker + "_recordings/lets_take_a_look.mp3");
            if (stim.exemplar_num > 1) {
                say_text = "Let's look at another one.";
                lets_look = new Audio("audio/" + stim.speaker + "_recordings/lets_look_another_one.mp3");
            }
            lets_look.play();


            agent_say(say_text, stim.trial_num, 2000).then(

                // Agent pokes blanket and blanket falls
                function() {


                    let deferred = new $.Deferred();

                    poke_blanket_fall(stim);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 1200);

                    return deferred.promise();
                }

            ).then(

                // Speech bubble disappears, object "closes" and disappears
                function() {
                    $(".speech").hide();
                    effect_remark_close(stim);
                }

            );

        // Pedagogical item presentation
        } else if ((stim.item_presentation_condition == "pedagogical") || (stim.item_presentation_condition == "gen+ped")) {

            let say_text = "Let me show you another one.";
            let show_you = new Audio("audio/" + stim.speaker + "_recordings/let_me_show_another.mp3");
            if (stim.exemplar_num == 1) {
                say_text = "Let me show you something."
                show_you = new Audio("audio/" + stim.speaker + "_recordings/let_me_show_you.mp3");
            }
            show_you.play();

            agent_say(say_text, stim.trial_num, 2000).then(

                // Agent pokes blanket and blanket falls
                function() {


                    let deferred = new $.Deferred();

                    poke_blanket_fall(stim);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 1200);

                    return deferred.promise();
                }

            ).then(

                // Agent says, "Watch this!"
                function() {


                    let deferred = new $.Deferred();

                    watch = new Audio("audio/" + stim.speaker + "_recordings/watch_this.mp3");
                    watch.play();

                    agent_say("Watch this!", stim.trial_num);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 1250);

                    return deferred.promise();
                }

            ).then(

                // Speech bubble disappears, object "closes" and disappears
                function() {
                    $(".speech").hide();
                    effect_remark_close(stim);
                }

            );

        }
    }
}

///  MAIN PROGRAM ///
function make_slides(f) {
    var slides = {};

    // Create introduction slide
    slides.i0 = slide({
        name : "i0",
    });

    // Botcaptcha (simple language followup check to include at beginning of experiment)
    slides.botcaptcha = slide({
        name : "botcaptcha",
        bot_trials : 0,
        all_responses: [],
        start: function() {

            // Record start time
            this.botcaptcha_startT = Date.now();

            // Create prompt and question
            $(".error").hide();
            speaker = _.sample(["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"]);
            listener = _.sample(["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Margaret"]);
            this.bot_utterance = speaker + " says to " + listener + ": \"It's a beautiful day, isn't it?\""
            this.bot_question = "Who is " + speaker + " talking to?"

            var bot_sentence = document.createElement("p");
            var bot_question = document.createElement("p");
            var content = document.createTextNode(this.bot_utterance);
            var q_content = document.createTextNode(this.bot_question);
            bot_sentence.name = "bot_sentence";
            bot_question.name = "bot_question";
            bot_sentence.appendChild(content);
            bot_question.appendChild(q_content);
            document.getElementById('bot_context').appendChild(bot_sentence);
            document.getElementById('bot_context').appendChild(bot_question);
            document.getElementById('bot_context').appendChild(document.createElement("br"));

         },
         button: function() {
            // get the participants' input
            bot_response = $("#botresponse").val();

            // Display error if participant does not provide input
            if (bot_response.toLowerCase() == "") {
                $(".error_incorrect").hide();
                $(".write_something").show();

            // Evaluate participant response
            } else {

                // Record response to MTurk
                this.all_responses.push(bot_response);

                // If response is correct, log botcaptcha data to MTurk and continue to next slide
                if (bot_response.toLowerCase() == listener.toLowerCase()) {

                    // Log data to MTurk
                    exp.catch_trials.push({
                        trial_type: "botcaptcha",
                        correct_answer: listener,
                        num_fails: this.bot_trials,
                        responses: this.all_responses,
                        trial_time_in_seconds: (Date.now() - this.botcaptcha_startT) / 1000
                    });

                    // Continue to next slide
                    exp.go();

                // gives participant two more trials if the response was incorrect
                } else {

                    this.bot_trials++;
                    $(".error").hide();
                    $(".error_incorrect").show();

                    if (this.bot_trials == 1) {
                        $(".error_2more").show();
                    } else if (this.bot_trials == 2) {
                        $(".error_1more").show();
                    } else {

                        // if participant fails three times, they cannot proceed
                        $(".error, #sound_button, #sound_test_button, .progress").hide();
                        $('#sound_response').prop("disabled", true);
                        $(".error_final").show();

                    }

                }
            }
        }
    });

    // Quasi-attention check and test for suitable user audio system/followup
    slides.sound_check = slide({
        name: "sound_check",
        sound_trials: 0,
        all_responses: [],
        start: function() {
            this.sound_startT = Date.now();
            this.sound_word = _.sample(["tiger", "shadow"]);
            this.sound = new Audio("audio/"+this.sound_word+".mp3");
            $('.error').hide();
        },
        test_sound: function() {
            this.sound.play();
        },
        button: function() {
            // get the participants' input
            sound_response = $("#sound_response").val();

            // Show error if no participant input
            if (sound_response.toLowerCase() == "") {
                $(".error_incorrect").hide();
                $(".write_something").show();

            // Evaluate participant input
            } else {

                // Record participant response
                this.all_responses.push(sound_response);

                // If response is correct, log to MTurk and continue to next slide
                if (sound_response.toLowerCase() == this.sound_word) {

                    // Log data to MTurk
                    exp.catch_trials.push({
                        trial_type: "sound_response",
                        correct_answer: this.sound_word,
                        num_fails: this.sound_trials,
                        responses: this.all_responses,
                        trial_time_in_seconds: (Date.now() - this.sound_startT) / 1000
                    });

                    exp.go();

                // gives participant two more trials if the response was incorrect
                } else {
                    this.sound_trials++;
                    $(".error").hide();
                    $(".error_incorrect").show();
                    if (this.sound_trials == 1) {
                            $(".error_2more").show();
                    } else if (this.sound_trials == 2) {
                            $(".error_1more").show();
                    } else {
                        // if participant fails, they cannot proceed
                            $(".error").hide();
                            $("#sound_button").hide();
                            $("#sound_test_button").hide();
                            $(".progress").hide();
                            $('#sound_response').prop("disabled", true);
                            $(".error_final").show();
                    };
                }
            }
        }
    });

    // Display specific experiment context and instructions
    slides.introduction = slide({
        name : "introduction",
        start: function() {

            // Track introduction slide starting time
            this.intro_startT = Date.now();

        },
        button : function() {

            // Track introduction slide end time
            this.intro_endT = Date.now();

            // Log introduction data (esp. duration) to full MTurk data
            _.extend(exp.trials_stimuli_full[0],
                {
                    trial_num: 0, // Introduction
                    trial_type: "introduction",
                    trial_time_in_seconds: (this.intro_endT - this.intro_startT) / 1000,
                    display_text: "You are a scientist being deployed to a remote field site on a faraway planet. Your job is to catalogue and describe new kinds of plants, animals, and objects that have been discovered on the planet. When you arrive at the field site, you meet other scientists there."
                }
            );

            // Log introduction data (esp. duration) to streamlined MTurk data
            _.extend(exp.trials_stimuli_streamlined[0],
                {
                    trial_num: 0, // Introduction
                    trial_type: "introduction",
                    trial_time_in_seconds: (this.intro_endT - this.intro_startT) / 1000
                }
            );

            // Continue to next slide
            exp.go();
        }
    });

    // Run experiment (sub)trials
    slides.trials = slide({
        name : "trials",
        present: exp.trials_stimuli,
        start: function() {
            // Included here so start time is not reset with each subtrial within each trial
            this.trials_startT = Date.now();
        },
        present_handle : function(stim) {

            this.stim = stim;
            console.log(this.stim);

            // This is animation sequence is defined as a separate function to avoid cluttering :P
            run_trial(this.stim, this);

            // Capture user response (prediction)
            if (this.stim.type == "response") {

                $(".container, .error").hide();
                $("#trials_text").show();
                $("#trials_text").text(this.stim.prompt);
                if (this.stim.section_type == "followup") {
                    $("#followup_title").show();
                }

                if (this.stim.show_scene) {
                    agent_straight(this.stim.agent);
                    $("." + this.stim.agent + "_straight").css("right", 360);
                    change_image("background", "images/back" + this.stim.background + ".jpg");
                    set_table(this.stim, false);
                    $(".label").hide();
                    $(".container").show();
                }

                if (this.stim.show_generic) {
                    $(".agent, .object, .error, .speech, .blanket, .label, .table, .background, .slider, .continue_button").hide();

                    let generic_statement;
                    if (this.stim.property == "squeaking") {
                        generic_statement = this.stim.item_name[1][0].toUpperCase() + this.stim.item_name[1].slice(1) + " squeak";
                    } else {
                        generic_statement = this.stim.item_name[1][0].toUpperCase() + this.stim.item_name[1].slice(1) + " have " + stim.property;
                    }

                    $("#generic_text").text("\"" + generic_statement + ".\"");

                    $("#generic_text").show();
                }

                // Display slider
                if (this.stim.response_type == "slider") {

                    // Create slider, initialized without position
                    this.init_sliders();
                    exp.sliderPost = null;

                    $("#slider_label_l").text(this.stim.slider_label_l);
                    $("#slider_label_r").text(this.stim.slider_label_r);

                    $(".slider").show();

                // Display MC options
                } else if (this.stim.response_type == "mc") {

                    // Clear previous multiple choice responses
                    $("input[name=mc_choice]").prop("checked", false);

                    // Display correct mc options and labels
                    let temp_counter = 0;
                    for (temp_counter = 0; temp_counter < this.stim.options.length; temp_counter++) {
                        $("#mc_choice" + (temp_counter + 1)).show();
                        $("#mc_choice" + (temp_counter + 1)).attr("value", this.stim.options[temp_counter][1]);
                        $("#mc_choice" + (temp_counter + 1)).parent().show();
                        $("#mc_label" + (temp_counter + 1)).text(this.stim.options[temp_counter][0]);
                    }

                    $(".mc").show();

                // Display checkbox grid
                } else if (this.stim.response_type == "grid") {

                    $(".grid").show();

                    let counter;
                    for (counter=1; counter <= 9; counter++) {
                        $("#grid_label" + counter).text(this.stim.grid_labels[counter-1]);
                        $("#grid_choice" + counter).attr("value", this.stim.grid_labels[counter-1]);
                    }

                } else if (this.stim.response_type == "freeform") {

                    $("#freeform").show();

                }

                // Continue to next subtrial
                $("#continue_button2").show();

                this.trials_responseT = Date.now();
            };

        },

        // Continue to next slide within subtrial
        continue_button1 : function() {
            _stream.apply(this);
        },

        // Create slider
        init_sliders: function() {
            utils.make_slider("#trials_slider", function(event, ui) {
                exp.sliderPost = ui.value;
            });
        },

        // Continue to next subtrial after response
        continue_button2 : function() {

            // No response on slider -> error
            if ((this.stim.response_type == "slider") && (exp.sliderPost == null)) {
                $(".slider_error").show();

            // Incorrect number of responses on grid -> error
            } else if ((this.stim.response_type == "grid") && ($("input[class=grid_choice]:checked").length != total_trials_num)) {
                $(".grid_error").text("Please select exactly " + total_trials_num + " item name(s) before continuing.");
                $(".grid_error").show();

            // No response on MC (radio) buttons -> error
            } else if ((this.stim.response_type == "mc") && (!($("input[name='mc_choice']").is(":checked")))) {
                $(".mc_error").show();

            // Log response data
            } else {
                this.trials_endT = Date.now();

                // If we are within the main trials, then we submit our data to trials_stimuli_full and trials_stimuli_streamlined
                if (this.stim.section_type == "main_trial") {

                    // Log trial duration and slider response to MTurk
                    exp.trials_response_data = exp.trials_response_data.concat([
                        _.extend(
                            {
                                trial_num: this.stim.trial_num,
                                prompt: this.stim.prompt,
                                trial_time_in_seconds: (this.trials_responseT - this.trials_startT) / 1000,
                                response: exp.sliderPost,
                                response_type: this.stim.response_type,
                                correct_answer: "NA",
                                is_correct: true, // For simplicity, slider response is always considered "right"
                                response_time_in_seconds: (this.trials_endT - this.trials_responseT) / 1000
                            }
                        )
                    ]);

                // If we are within the followup checks ("follow-up questions"), then we submit our data to followup_
                } else if (this.stim.section_type == "followup") {

                    // Slider
                    if (this.stim.response_type == "slider") {

                        this.response = exp.sliderPost;

                    // Checkbox grid
                    } else if (this.stim.response_type == "grid") {

                        let temp_responses = [];

                        $("input[class=grid_choice]:checked").each(function(){
                            temp_responses.push($(this).val());
                        });

                        this.response = temp_responses.sort();

                    // Multiple-choice (MC)
                    } else if (this.stim.response_type == "mc") {
                        this.response = $("input[name=mc_choice]:checked").val();

                    // Freeform
                    } else if (this.stim.response_type == "freeform") {
                        this.response = $("#freeform").val();

                    }

                    // Checks if the user response is correct
                    if (this.stim.correct_answer == "NA") {
                        this.is_correct = true; // For simplicity, slider and freeform responses are always considered "right"
                        if ((this.stim.response_type == "freeform") && ($("#freeform").val() == "")) {
                            this.is_correct = false; // ...unless they didn't write anything in the freeform box
                        }
                    } else {
                        if (typeof(this.stim.correct_answer) == "object") {
                            this.is_correct = list_content_equals(this.response, this.stim.correct_answer);
                        } else {
                            this.is_correct = (this.response == this.stim.correct_answer);
                        }

                    }

                    // Log followup duration and slider response to MTurk
                    exp.followup_response_data = exp.followup_response_data.concat([
                        _.extend(
                            {
                                trial_num: this.stim.trial_num,
                                prompt: this.stim.prompt,
                                response: this.response,
                                response_type: this.stim.response_type,
                                correct_answer: this.stim.correct_answer,
                                is_correct: this.is_correct,
                                response_time_in_seconds: (this.trials_endT - this.trials_responseT) / 1000
                            }
                        )
                    ]);

                };

                _stream.apply(this);

                // Resets start time for each trial besides the very first
                this.trials_startT = Date.now();
            }
        }
    });

    // Form to collect optional subject data
    slides.subj_info = slide({
        name : "subj_info",
        start: function() {
            $("#submit_button").show();
        },
        submit : function(e){
            exp.subj_data = {
                language : $("#language").val(),
                enjoyment : $("#enjoyment").val(),
                assess : $('input[name="assess"]:checked').val(),
                age : $("#age").val(),
                gender : $("#gender").val(),
                education : $("#education").val(),
                comments : $("#comments").val(),
                problems: $("#problems").val(),
                fairprice: $("#fairprice").val()
            };
            exp.go(); //use exp.go() if and only if there is no "present" data.
        }
    });

    slides.thanks = slide({
        name : "thanks",
        start : function() {

            // Hide progress bar
            $("progress").hide();

            // Logs data to MTurk
            exp.data = {
                condition: exp.condition,
                catch_trials: exp.catch_trials,
                trials_stimuli_full: exp.trials_stimuli_full, // What is displayed to the user (unflattened)
                trials_stimuli_streamlined: exp.trials_stimuli_streamlined, // What is displayed to the user (flattened)
                trials_response_data: exp.trials_response_data, // What the user responds (times and sliders) for the main trials
                system: exp.system,
                followup_response_data: exp.followup_response_data, // What the user responds for the followup questions
                subject_information: exp.subj_data,
                total_time_in_seconds: (Date.now() - exp.startT) / 1000
            };

            // Delay sending data to MTurk for 1000 ms
            setTimeout(function() {turk.submit(exp.data);}, 1000);
        }
    });

    return slides;
}

/// init ///
function init() {

    // Unique Turker, to ensure that MTurk Workers are unique; may be commented out during Sandbox testing, but make sure to keep when uploaded to MTurk production website!
    repeatWorker = false;
    (function(){
            // TODO: uncomment after testing
            // var ut_id = "tg-2020-05-05-genex";
            // if (UTWorkerLimitReached(ut_id)) {
            //     $('.slide').empty();
            //     repeatWorker = true;
            //     alert("You have already completed the maximum number of HITs allowed by this requester. Please click 'Return HIT' to avoid any impact on your approval rating.");
            // }
    })();

    // Log user system information
    exp.system = {
        Browser : BrowserDetect.browser,
        OS : BrowserDetect.OS,
        screenH: screen.height,
        screenUH: exp.height,
        screenW: screen.width,
        screenUW: exp.width
    };

    // Blocks of the experiment:
    exp.structure=[ // TODO: restore all blocks
        // "i0",
        // "botcaptcha",
        // "sound_check",
        "introduction",
        "trials",
        "subj_info",
        "thanks"
    ];

    // Used to run present_handle
    exp.trials_stimuli = [];

    // Used to submit to MTurk — very complete data, not flattened
    exp.trials_stimuli_full = [{}]; // Initialized empty so trial_num 0 (introduction) data can be filled in later

    // Used to submit to MTurk — streamlined and flattened
    exp.trials_stimuli_streamlined = [{}]; // Initialized with empty {} so trial_num 0 (introduction) can be filled in later

    // Used to submit to MTurk — contains user slider responses and times for main trials
    exp.trials_response_data = [];

    // Used to submit to MTurk — contains followup "trial" response data
    exp.followup_response_data = [];

    // For the accidental condition, we present a certain number of total stimuli spread across multiple trials, with each of those trials only presenting a single stimulus; this factor adjusts for that fact
    let accidental_factor = 1;
    let n_examples_per_subtrial = n_examples[0];
    if (item_presentation_condition[0] == "accidental") {
        accidental_factor = n_examples[0];
        n_examples_per_subtrial = 1;
    }

    // Adds data to run present_handle, based on the number of trials we want (specified at top of doc)
    let trial_num;
    for (trial_num = 0; trial_num < total_trials_num * accidental_factor; trial_num++) {

        // Account for the same background/stimulus in all accidental trials
        let effective_trial_num = trial_num;
        if (item_presentation_condition[0] == "accidental") {
            effective_trial_num = 0;
        }

        if (item_presentation_condition[0] == "generic_text_only") {

            exp.trials_stimuli = exp.trials_stimuli.concat([

                _.extend(
                    {
                        trial_num: trial_num + 1,
                        type: "text",
                        item_presentation_condition: item_presentation_condition[0],
                        property: objects[effective_trial_num][2],
                        item_name: item_name[effective_trial_num]
                    }
                )

            ]);

        } else {

            exp.trials_stimuli = exp.trials_stimuli.concat([

                // Adds agent greeting slide to trial
                _.extend(
                    {
                        trial_num: trial_num + 1,
                        type: "greeting",
                        item_presentation_condition: item_presentation_condition[0],
                        background: back[effective_trial_num],
                        agent: agents[trial_num],
                        speaker: speakers[trial_num]
                    }
                )

            ]);

        }

        // Adds agent remarking at item(s) on table slide to trial
        exp.trials_stimuli = exp.trials_stimuli.concat([
            _.extend(
                {
                    trial_num: trial_num + 1,
                    type: "on_the_table",
                    item_presentation_condition: item_presentation_condition[0],
                    agent: agents[trial_num],
                    object: objects[effective_trial_num],
                    item_name: item_name[effective_trial_num],
                    n_examples: n_examples_per_subtrial,
                    speaker: speakers[trial_num]
                }
            )
        ]);

        if ((item_presentation_condition[0] == "accidental") || (item_presentation_condition[0] == "naive")) {
            // Adds agent "oh I see" statement slide to trial
            exp.trials_stimuli = exp.trials_stimuli.concat([
                _.extend(
                    {
                        trial_num: trial_num + 1,
                        type: "oh_i_see",
                        item_presentation_condition: item_presentation_condition[0],
                        agent: agents[trial_num],
                        object: objects[effective_trial_num],
                        item_name: item_name[effective_trial_num],
                        n_examples: n_examples_per_subtrial,
                        speaker: speakers[trial_num]
                    }
                )
            ]);
        }

        // Adds agent statement of knowledge slide to trial
        exp.trials_stimuli = exp.trials_stimuli.concat([
            _.extend(
                {
                    trial_num: trial_num + 1,
                    type: "agent_knowledge",
                    item_presentation_condition: item_presentation_condition[0],
                    agent: agents[trial_num],
                    object: objects[effective_trial_num],
                    item_name: item_name[effective_trial_num],
                    n_examples: n_examples_per_subtrial,
                    speaker: speakers[trial_num]
                }
            )
        ]);

        // For generic, generic_no_visual, and gen+ped conditions: create slide for agent teaching property via generic statement
        if ((item_presentation_condition[0] != "generic_text_only") && (item_presentation_condition[0].includes("generic") || (item_presentation_condition[0] == "gen+ped"))) {
            exp.trials_stimuli = exp.trials_stimuli.concat([
                _.extend(
                    {
                        trial_num: trial_num + 1,
                        type: "tell_you",
                        item_presentation_condition: item_presentation_condition[0],
                        agent: agents[trial_num],
                        object: objects[effective_trial_num],
                        item_name: item_name[effective_trial_num],
                        n_examples: n_examples_per_subtrial,
                        speaker: speakers[trial_num]
                    }
                )
            ]);
        }

        // Creates subtrial for each of the exemplars (allows agent to interact with each exemplar object)
        let exemplar_num = 1;
        while ((exemplar_num <= n_examples_per_subtrial) && (!(item_presentation_condition[0].includes("generic")))) {

            // Create subtrial with given exemplar_num (number of object agent interacts with on this slide of the subtrial)
            exp.trials_stimuli = exp.trials_stimuli.concat([
                _.extend(
                    {
                        trial_num: trial_num + 1,
                        type: "trial",
                        item_presentation_condition: item_presentation_condition[0],
                        agent: agents[trial_num],
                        object: objects[effective_trial_num],
                        item_name: item_name[effective_trial_num],
                        n_examples: n_examples_per_subtrial,
                        speaker: speakers[trial_num],
                        exemplar_num: exemplar_num++
                    }
                )
            ]);
        }

        // Logs each trial's stimuli to data to be submitted to MTurk — full version
        exp.trials_stimuli_full = exp.trials_stimuli_full.concat([
            _.extend(
                {
                    trial_num: trial_num + 1,
                    trial_type: "trial",
                    item_presentation_condition: item_presentation_condition[0],
                    agent: {
                        name: agents[trial_num],
                        straight_image: agents[trial_num] + "_straight.png",
                        point_r_image: agents[trial_num] + "_point_r.png"
                    },
                    object: {
                        name: objects[effective_trial_num][0],
                        property: objects[effective_trial_num][2],
                        closed_image: objects[effective_trial_num][1] + "_closed.svg",
                        open_image: objects[effective_trial_num][1] + "_open.svg"
                    },
                    item_name: {
                        singular: item_name[effective_trial_num][0],
                        plural: item_name[effective_trial_num][1]
                    },
                    n_examples: n_examples_per_subtrial,
                    speaker: speakers[trial_num],
                    background: back[effective_trial_num],
                    spoken_text: [] // Will be fleshed out via agent_say()
                }
            )
        ]);

        // Logs each trial's stimuli to data to be submitted to MTurk — streamlined version
        exp.trials_stimuli_streamlined = exp.trials_stimuli_streamlined.concat([
            _.extend(
                {
                    trial_num: trial_num + 1,
                    trial_type: "trial",
                    item_presentation_condition: item_presentation_condition[0],
                    agent: agents[trial_num],
                    object: objects[effective_trial_num][0],
                    property: objects[effective_trial_num][2],
                    item_name: item_name[effective_trial_num][0],
                    n_examples: n_examples_per_subtrial,
                    speaker: speakers[trial_num],
                    background: back[effective_trial_num]
                }
            )
        ]);

        // Creates grammatically correct statement that makes sense based on the item presentation condition
        let prompt = "";
        let article = "";
        if (item_presentation_condition[0].includes("generic")) {
            article = " a ";
        } else {
            article = " another ";
        };
        if (objects[effective_trial_num][2] == "squeaking") {
            prompt = "Imagine that you come across" + article + item_name[effective_trial_num][0] + ". What are the chances that it squeaks?";
        } else {
            prompt = "Imagine that you come across" + article + item_name[effective_trial_num][0] + ". What are the chances that it has " + objects[effective_trial_num][2] + "?";
        };

        // Adds slider response slide
        if (!((item_presentation_condition[0] == "accidental") && (trial_num == 0))) {
            exp.trials_stimuli = exp.trials_stimuli.concat([
                _.extend(
                    {
                        trial_num: trial_num + 1,
                        section_type: "main_trial",
                        type: "response",
                        prompt: prompt,
                        correct_answer: "NA",
                        show_scene: false,
                        show_generic: false,
                        response_type: "slider",
                        slider_label_l: "0% (impossible)",
                        slider_label_r: "100% (certain)",
                        item_presentation_condition: item_presentation_condition[0]
                    }
                )
            ]);
        }
    };

    // Now, we add followup (attention and manipulation) comprehension checks to "trials_stimuli" to be run via present_handle...

    // This is the number of followup "trial" we're on
    let check_num = 1;

    let prompt = "Would you say the following is true?";

    exp.trials_stimuli = exp.trials_stimuli.concat([
        _.extend(
            {
                trial_num: check_num++,
                type: "response",
                section_type: "followup",
                prompt: prompt,
                correct_answer: "NA",
                show_scene: false,
                show_generic: true,
                property: objects[0][2],
                item_name: item_name[0],
                response_type: "slider",
                grid_labels: grid_name_labels,
                slider_label_l: "0% (definitely false)",
                slider_label_r: "100% (definitely true)",
                item_presentation_condition: item_presentation_condition[0]
            }
        )
    ]);

    // Create grammatically correct prompt statement
    prompt = "What are the names of the " + total_trials_num + " items you learned about? ";
    if (total_trials_num == 1) {
        prompt = "What is the name of the item you learned about? ";
    }
    prompt += "Please select its name from the options below.";

    exp.trials_stimuli = exp.trials_stimuli.concat([
        _.extend(
            {
                trial_num: check_num++,
                type: "response",
                section_type: "followup",
                prompt: prompt,
                correct_answer: correct_names, // FYI this is defined near the top of experiment.js
                show_scene: false,
                show_generic: false,
                response_type: "grid",
                grid_labels: grid_name_labels,
                item_presentation_condition: item_presentation_condition[0]
            }
        )
    ]);

    if (item_presentation_condition[0] != "generic_text_only") { // These checks are not applicable for the text-only generic condition

        let how_many_exemplars = n_examples_per_subtrial;
        if (item_presentation_condition[0].includes("generic")) {
            how_many_exemplars = 0;
        }

        let correct_answer = "been_while";
        if ((item_presentation_condition[0] == "accidental") || (item_presentation_condition[0] == "naive")) {
            correct_answer = "just_arrived";
        }

        // Perceived agent arrival check: Just arrived vs. been here for a while
        exp.trials_stimuli = exp.trials_stimuli.concat([
            _.extend(
                {
                    trial_num: check_num++,
                    type: "response",
                    section_type: "followup",
                    prompt: "Please refer to the image below. How long has this character been doing research on this planet?",
                    correct_answer: correct_answer,
                    show_scene: true,
                    show_generic: false,
                    agent: agents[0],
                    background: back[0],
                    object: objects[0],
                    item_name: item_name[0],
                    n_examples: how_many_exemplars,
                    response_type: "mc",
                    options: [ ["This character is a new researcher and just arrived here", "just_arrived"], ["This character has been doing research on this planet for a while", "been_while"] ],
                    item_presentation_condition: item_presentation_condition[0]
                }
            )
        ]);

        let object_statement = "object";
        let demonstrative = "this ";
        let pronoun = "its ";
        let article_statement = "a " + item_name[0][0];

        if (n_examples_per_subtrial != 1) {
            demonstrative = "these ";
            object_statement += "s";
            pronoun = "their ";
            article_statement = item_name[0][1];
        };

        if (item_presentation_condition[0].includes("generic"))
        {
            object_statement = item_name[0][1];
        } else {
            object_statement = demonstrative + object_statement;
        }

        let show_property = " show " + pronoun + objects[0][2];
        let have_property = "could have " + objects[0][2];
        if (objects[0][2] == "squeaking") {
            show_property = " squeak";
            have_property = "could squeak";
        }

        correct_answer = "yes_preknowledge";
        if ((item_presentation_condition[0] == "accidental") || (item_presentation_condition[0] == "naive")) {
            correct_answer = "no_preknowledge";
        }

        // Agent preknowledge question
        exp.trials_stimuli = exp.trials_stimuli.concat([
            _.extend(
                {
                    trial_num: check_num++,
                    type: "response",
                    section_type: "followup",
                    prompt: "Please refer to the image below. Did this character know that " + article_statement + " " + have_property + " before you observed it together?",
                    correct_answer: correct_answer,
                    show_scene: true,
                    show_generic: false,
                    agent: agents[0],
                    background: back[0],
                    object: objects[0],
                    item_name: item_name[0],
                    n_examples: how_many_exemplars,
                    response_type: "mc",
                    options: [ ["Yes", "yes_preknowledge"], ["No", "no_preknowledge"] ],
                    item_presentation_condition: item_presentation_condition[0]
                }
            )
        ]);


        // Freeform response, to gauge data quality on MTurk
        exp.trials_stimuli = exp.trials_stimuli.concat([
            _.extend(
                {
                    trial_num: check_num++,
                    type: "response",
                    section_type: "followup",
                    prompt: "In the text box below, please describe briefly what happened in this experiment.",
                    correct_answer: "NA",
                    show_scene: false,
                    show_generic: false,
                    response_type: "freeform",
                    item_presentation_condition: item_presentation_condition[0]
                }
            )
        ]);
    }

    // Initialize data frames to be submitted to MTurk — data will be added as slides are run
    exp.catch_trials = [];
    exp.followup_data = [];
    exp.condition = {
        item_presentation_condition: item_presentation_condition[0],
        n_examples: n_examples_per_subtrial
    };

    //make corresponding slides:
    exp.slides = make_slides(exp);

    exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                                        //relies on structure and slides being defined

    $(".slide").hide(); //hide everything

    //make sure turkers have accepted HIT (or you're not in mturk)
    $("#start_button").click(function() {
        if (turk.previewMode) {
            $("#mustaccept").show();
        } else {
            $("#start_button").click(function() {$("#mustaccept").show();});
            exp.startT = Date.now();
            exp.go();
        }
    });

    // Extra check for US IP addresses
    // TODO: add support for Canadian IP addresses
    function USOnly() {
        var accessKey = "b487843addca6e9ec32e6ae28aeaa022";
         $.ajax({
             url: "https://geo.ipify.org/api/v1?apiKey=at_nuIzsEIQJAft6sr1WH67UTfFDeMIO",
             dataType: "jsonp",
             success: function(json) {
             if (json.location.country != "US") {
                 var slides = document.getElementsByClassName("slide");
                 for (i=0; i<slides.length; i++) {
                    slides[i].style.display = "none";
                 }
                    document.getElementsByClassName("progress")[0].style.display = "none";
                    document.getElementById("unique").innerText = "This HIT is only available to workers in the United States. Please click 'Return' to avoid any impact on your approval rating.";
                }
            }
         });
    }

    exp.go(); //show first slide
    USOnly(); // check US IP address
}