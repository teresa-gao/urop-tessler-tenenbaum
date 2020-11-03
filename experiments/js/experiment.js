// OUTLINE OF OF experiment.js FILE:
// 1) Variable declarations
// 2) Helper unctions
// 3) Main program
// 4) Init and setup



//////////////////////////////////////////
// VARIABLE DECLARATIONS /////////////////
//////////////////////////////////////////

var back =              _.shuffle( [1,2,3,4,5,6,7,8,9,10] ); // Background images
var agents =            _.shuffle( ["Elephant","Pig","Monkey","Dog","Bear","Tiger","Cat","Sheep"] );
var speakers =          _.shuffle( ["mh", "tg", "sb"] );

var artifacts =         _.shuffle([ ["artifact", "artifact01", "squeaking"], ]);
var flowers =           _.shuffle([ ["flower", "flower01", "purple petals"] ]);
var birds =             _.shuffle([ ["bird", "bird02", "green feathers"] ]);
var objects =           _.shuffle([ birds[0], flowers[0], artifacts[0] ]);

var item_name =         _.shuffle([ ["blicket", "blickets"], ["dax", "daxes"], ["fep", "feps"] ]);
var n_examples =        _.shuffle([1, 2]);
var item_presentation_condition = _.shuffle(["accidental", "pedagogical"]);



//////////////////////////////////////////
// HELPER FUNCTIONS //////////////////////
//////////////////////////////////////////

function change_image(class_name, source) {
    changing_images = document.getElementsByClassName(class_name);
    for (var i=0; i<changing_images.length; i+=1) {
        changing_images[i].src = source;
    }

}

function agent_say(display_text, bubble_width=400, duration=2000) {

    let deferred = new $.Deferred();

    $(".speech").show();
    $("#speech-bubble").text(display_text);
    $("#speech-bubble").width(bubble_width);

    // TODO: log spoken text to trials_stimuli_full (to be sent to Prolific)

    setTimeout (function() {
        deferred.resolve();
    }, duration);

    return deferred.promise();
}

function set_agent_object_scene(stim) {

    let deferred = new $.Deferred();

    let fade_in_duration = 1750;
    let fade_out_duration = 1750;

    let fade_in_tags = "#background, #" + stim.agent;

    $(".speech").hide();
    $(".agent_intro, #background, #" + stim.agent).fadeOut(fade_out_duration, complete=function() {

            $(".agent").css("right", "+=100px")
            $("#speech-bubble-tail, #speech-bubble-outline").css("left", "-=100px");

            change_image("closed", "images/" + stim.object[1] + "_closed.svg");
            change_image("open", "images/" + stim.object[1] + "_open.svg");

            let counter;
            for (counter = 1; counter <= stim.n_examples; counter++) {
                $("#label" + counter).text(stim.item_name[0].toUpperCase());
                fade_in_tags += ", .object" + counter + ".closed, #label" + counter;
            }

            if (stim.object[0] == "bird") {
                fade_in_tags += ", #tree";
                $(".label").css("bottom", "210px");
                $(".object").css("bottom", "225px");
            }

            if (stim.object[0] == "flower") {
                fade_in_tags += ", #dirt";
                $(".label").css("bottom", "27px");
                $(".object").css("bottom", "35px");

                // Shift artifacts and labels right
                $(".label").css("left", "+=5px");
                $(".object").css("right", "-=5px");
            }

            if (stim.object[0] == "artifact") {
                fade_in_tags += ", #table";
                $(".label").css("bottom", "215px");
                $(".object").css("bottom", "125px");
                $(".object").css("height", "105px");

                // Shift artifacts and labels right
                $(".label").css("left", "+=5px");
                $(".object").css("right", "-=5px");
            }

            $(fade_in_tags).fadeIn(fade_in_duration);

        }

    )

    setTimeout (function() {
        deferred.resolve();
    }, fade_in_duration + fade_out_duration);

    return deferred.promise();

}

function show_object_property(stim, object_num) {

    let deferred = new $.Deferred();

    if (stim.object[0] == "artifact") {

        squeak = new Audio("audio/squeak.mp3");
        squeak.play();

        $(".object" + object_num).animate(
            { height: "-=10px", width: "+=0px"},
            { duration: 300}
        );
        $(".object" + object_num).animate(
            { height: "+=10px", width: "+=0px"},
            { duration: 300}
        );

    } else {

        if (stim.object[0] == "bird") {
            property_sound = new Audio("audio/bird_chirp.mp3");
            $(".object1.open").css("right", "210px");
            $(".object2.open").css("right", "140px");
            $(".object3.open").css("right", "70px");
            $(".object4.open").css("right", "0px");
        }

        if (stim.object[0] == "flower") {
            property_sound = new Audio("audio/gliss_up.mp3");
            $(".object.open").css("height", "99px");
        }

        property_sound.play();

        $(".object" + object_num + ".closed").fadeOut(600);
        $(".object" + object_num + ".open").fadeIn(600);

    }

    setTimeout (function() {
        deferred.resolve();
    }, 1000);

    return deferred.promise();

}

function show_all_object_properties(stim) {

    let deferred = new $.Deferred();

    let total_wait_time = 500; // for guaranteed first object showing property

    show_object_property(stim, 1).then(

        function() {

            let deferred = new $.Deferred();
            let wait_time = 0;

            if (stim.n_examples >= 2) {
                show_object_property(stim, 2);
                wait_time = 500;
            }

            total_wait_time += wait_time;

            setTimeout (function() {
                deferred.resolve();
            }, wait_time);

            return deferred.promise();

        }

    ).then(

        function() {

            let deferred = new $.Deferred();
            let wait_time = 0;

            if (stim.n_examples >= 3) {
                show_object_property(stim, 3);
                wait_time = 500;
            }

            total_wait_time += wait_time;

            setTimeout (function() {
                deferred.resolve();
            }, wait_time);

            return deferred.promise();

        }

    ).then(

        function() {

            let deferred = new $.Deferred();
            let wait_time = 0;

            if (stim.n_examples >= 4) {
                show_object_property(stim, 4);
                wait_time = 500;
            }

            total_wait_time += wait_time;

            setTimeout (function() {
                deferred.resolve();
            }, wait_time);

            return deferred.promise();

        }

    )

    setTimeout (function() {
        deferred.resolve();
    }, total_wait_time + 1250); // extra time accounts for browser delay

    return deferred.promise();

}

function run_trial(stim) {

    $(".continue_button").hide();

    if (stim.type == "agent_intro") {

        $(".agent, .object, #tree, #dirt, #table, .label, #followup").hide();
        $("#background").attr("src", "images/back" + stim.background + ".jpg");
        $(".agent_intro, #" + stim.agent).show();

        let agent_from_right = 200;
        $(".agent").css("right", agent_from_right + "px");
        $("#speech-bubble-tail, #speech-bubble-outline").css("left", 475 - agent_from_right + "px");

        if (stim.item_presentation_condition == "accidental") {

            agent_say("Hello! I am a new researcher. I just arrived on this planet.", width=425, duration=4000).then(

                function() {

                    let deferred = new $.Deferred();

                    agent_say("I don't know anything about the animals, plants, or objects here.", width=475);
                    // TODO: add speaker voice audio

                    setTimeout (function() {
                        deferred.resolve();
                    }, 2000); // TODO: update duration

                    return deferred.promise();

                }

            ).then(

                function() {
                    $(".speech").hide();
                    $("#continue_button").show();
                }

            );

        }

        if (stim.item_presentation_condition == "pedagogical") {

            agent_say("Hello! I've been doing research on this planet for a while.", width=425, duration=4000).then(

                function() {

                    let deferred = new $.Deferred();

                    agent_say("I know all about the animals, plants, and objects here.", width=400, duration=2500);
                    // TODO: add speaker voice audio

                    setTimeout (function() {
                        deferred.resolve();
                    }, 2500); // TODO: update duration

                    return deferred.promise();

                }

            ).then(

                function() {
                    $(".speech").hide();
                    $("#continue_button").show();
                }

            );

        }

    }

    if (stim.type == "object_encounter") {

        if (stim.item_presentation_condition == "accidental") {

            set_agent_object_scene(stim).then(

                function() {

                    let deferred = new $.Deferred();

                    agent_say("Hmm, I wonder what we have here.", bubble_width=300);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 3000); // TODO: update duration

                    return deferred.promise();

                }

            ).then(

                function() {

                    let deferred = new $.Deferred();

                    let statement = "Oh, I see! These are " + stim.item_name[1] + ".";
                    if (stim.n_examples == 1) {
                        statement = "Oh, I see! This is a " + stim.item_name[0] + ".";
                    }

                    agent_say(statement, bubble_width=225);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 2000); // TODO: update duration

                    return deferred.promise();

                }

            ).then(

                function() {
                    $(".speech").hide();
                    $("#continue_button").show();
                }

            );

        }

        if (stim.item_presentation_condition == "pedagogical") {

            agent_say("I have something to show you. Follow me!", bubble_width=325).then(

                function() {

                    let deferred = new $.Deferred();

                    set_agent_object_scene(stim);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 3500); // TODO: update duration

                    return deferred.promise();
                }

            ).then(

                function() {

                    let deferred = new $.Deferred();

                    let statement = "These are " + stim.item_name[1] + ".";
                    if (stim.n_examples == 1) {
                        statement = "This is a " + stim.item_name[0] + ".";
                    }

                    let bubble_width = 125;
                    if (stim.item_name[0] == "blicket") {
                        bubble_width += 50;
                    }

                    agent_say(statement, bubble_width=bubble_width);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 2000); // TODO: update duration

                    return deferred.promise();

                }

            ).then(

                function() {
                    $(".speech").hide();
                    $("#continue_button").show();
                }

            );

        }

    }

    if (stim.type == "object_property") {

        let agent_right_distance = 88;
        let agent_animate_duration = 500;

        if (stim.item_presentation_condition == "accidental") {

            $(".speech").hide();

            $("#" + stim.agent).animate(
                { right: "-=" + agent_right_distance + "px"},
                agent_animate_duration,
                function() {

                    $("#speech-bubble-tail, #speech-bubble-outline").css("left", "+=65px");

                    show_all_object_properties(stim).then(

                        function() {

                            let deferred = new $.Deferred();

                            // TODO: readd speaker voice audio
                            let delay_time = 3000;
                            // let audio_file_name = "see_"; // TODO

                            say_text = "Oh wow! ";
                            audio_file_name = "wow_";
                            delay_time += 500;

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

                            // TODO: readd speaker voice audio
                            // remark = new Audio("audio/" + stim.speaker + "_recordings/" + audio_file_name + ".mp3");
                            // remark.play();

                            agent_say(say_text, bubble_width=200);

                            setTimeout (function() {
                                deferred.resolve();
                            }, delay_time);

                            return deferred.promise();

                        }

                    ).then(

                        function() {
                            $(".object.open").fadeOut(600);

                            let fade_in_tags = "";

                            let counter;
                            for (counter = 1; counter <= stim.n_examples; counter++) {
                                fade_in_tags += ".object" + counter + ".closed";
                                if (counter != stim.n_examples) {
                                    fade_in_tags += ", ";
                                }
                            }

                            $(fade_in_tags).fadeIn(600);
                            $(".speech").hide();
                        }

                    ).then(

                        function() {

                            $("#continue_button").show();

                        }

                    );

                }

            )

        }

        if (stim.item_presentation_condition == "pedagogical") {

            agent_say("Watch this!", bubble_width=100, duration=1500).then(

                function() {

                    $(".speech").hide();

                    $("#" + stim.agent).animate(
                        { right: "-=" + agent_right_distance + "px"},
                        agent_animate_duration,
                        function() {

                            $("#speech-bubble-tail, #speech-bubble-outline").css("left", "+=65px");

                            show_all_object_properties(stim).then(

                                function() {

                                    let deferred = new $.Deferred();

                                    // TODO: readd speaker voice audio
                                    let delay_time = 3000;
                                    let audio_file_name = "see_"; // TODO
                                    let bubble_width = 150;

                                    say_text = "See? ";
                                    delay_time += 500;

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
                                            bubble_width += 50;
                                        }

                                    }

                                    // TODO: readd speaker voice audio
                                    // remark = new Audio("audio/" + stim.speaker + "_recordings/" + audio_file_name + ".mp3");
                                    // remark.play();

                                    agent_say(say_text, bubble_width=bubble_width);

                                    setTimeout (function() {
                                        deferred.resolve();
                                    }, delay_time);

                                    return deferred.promise();

                                }

                            ).then(

                                function() {
                                    $(".object.open").fadeOut(600);

                                    let fade_in_tags = "";

                                    let counter;
                                    for (counter = 1; counter <= stim.n_examples; counter++) {
                                        fade_in_tags += ".object" + counter + ".closed";
                                        if (counter != stim.n_examples) {
                                            fade_in_tags += ", ";
                                        }
                                    }

                                    $(fade_in_tags).fadeIn(600);
                                    $(".speech").hide();
                                }

                            ).then(

                                function() {

                                    $("#continue_button").show();

                                }

                            );

                        }

                    )

                }

            )

        }

    }

    // TODO: followup

    if (stim.type == "followup") {

        console.log("stim.type is followup")

        $("#followup, #trials_text, #followup_title").show();
        $("#animation_container, .error, .slider, .grid, .mc, .freeform").hide();
        $("#trials_text").text(stim.prompt);

        if (stim.show_scene) {

            console.log("stim.show_scene is true");

            agent_straight(stim.agent);
            $("." + stim.agent + "_straight").css("right", 360);
            change_image("background", "images/back" + stim.background + ".jpg");
            set_table(stim, false);
            $(".label").hide();
            $("#animation_container").show();
        }

        if (stim.show_generic) {

            console.log("stim.show_generic is true");

            $(".agent, .object, .error, .speech, .blanket, .label, .table, .background, .slider, .continue_button").hide();

            let generic_statement = generic_statement = stim.item_name[1][0].toUpperCase() + stim.item_name[1].slice(1) + " have " + stim.property;
            if (stim.property == "squeaking") {
                generic_statement = stim.item_name[1][0].toUpperCase() + stim.item_name[1].slice(1) + " squeak";
            }

            $("#generic_text").text("\"" + generic_statement + ".\"");
            $("#generic_text").show();
        }

        if (stim.response_type == "slider") {

            console.log("stim.response_type is slider");

            // Create slider, initialized without position
            utils.make_slider("#trials_slider", function(event, ui) {
                exp.sliderPost = ui.value;
            });
            exp.sliderPost = null;

            $("#slider_label_l").text(stim.slider_label_l);
            $("#slider_label_r").text(stim.slider_label_r);

            $(".slider").show();

        }

        if (stim.response_type == "mc") {

            console.log("stim.response_type is mc");

            // Clear previous multiple choice responses
            $("input[name=mc_choice]").prop("checked", false);

            // Display correct mc options and labels
            let temp_counter = 0;
            for (temp_counter = 0; temp_counter < stim.options.length; temp_counter++) {
                $("#mc_choice" + (temp_counter + 1)).show();
                $("#mc_choice" + (temp_counter + 1)).attr("value", stim.options[temp_counter][1]);
                $("#mc_choice" + (temp_counter + 1)).parent().show();
                $("#mc_label" + (temp_counter + 1)).text(stim.options[temp_counter][0]);
            }

            $(".mc").show();

        }

        if (stim.response_type == "grid") {

            console.log("stim.response_type is grid");

            $(".grid").show();

            let counter;
            for (counter=1; counter <= 9; counter++) {
                $("#grid_label" + counter).text(stim.grid_labels[counter-1]);
                $("#grid_choice" + counter).attr("value", stim.grid_labels[counter-1]);
            }

        }

        if (stim.response_type == "freeform") {

            console.log("stim.response_type is freeform");

            $("#freeform").show();

        }

        $("#submit_data_button").show();

    }

}


//////////////////////////////////////////
// MAIN PROGRAM //////////////////////////
//////////////////////////////////////////

function make_slides(f) {
    var slides = {};

    // Create introduction slide
    slides.i0 = slide({
        name : "i0",
        button: function() {
            $(".progress").show();
            exp.go();
        }
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

                // Record response to Prolific
                this.all_responses.push(bot_response);

                // If response is correct, log botcaptcha data to Prolific and continue to next slide
                if (bot_response.toLowerCase() == listener.toLowerCase()) {

                    // Log data to Prolific
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

                // If response is correct, log to Prolific and continue to next slide
                if (sound_response.toLowerCase() == this.sound_word) {

                    // Log data to Prolific
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
                            $(".error, #sound_button, #sound_test_button, .progress").hide();
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

            this.intro_startT = Date.now();
            $(".progress").show();

        },
        button : function() {

            // Track introduction slide end time
            this.intro_endT = Date.now();

            // Log introduction data (esp. duration) to full Prolific data
            _.extend(exp.trials_stimuli_full[0],
                {
                    slide_num: 0, // Introduction
                    trial_type: "introduction",
                    trial_time_in_seconds: (this.intro_endT - this.intro_startT) / 1000,
                    display_text: "You are a scientist being deployed to a remote field site on a faraway planet. Your job is to catalogue and describe new kinds of plants, animals, and objects that have been discovered on the planet. When you arrive at the field site, you meet other scientists there."
                }
            );

            // Log introduction data (esp. duration) to streamlined Prolific data
            _.extend(exp.trials_stimuli_streamlined[0],
                {
                    slide_num: 0, // Introduction
                    trial_type: "introduction",
                    trial_time_in_seconds: (this.intro_endT - this.intro_startT) / 1000
                }
            );

            // Continue to next slide
            exp.go();
        }
    });

    // Run experiment
    slides.trials = slide({

        name : "trials",
        present: exp.trials_stimuli,

        start: function() {

            this.trials_startT = Date.now();

        },

        present_handle : function(stim) {

            this.stim = stim;

            // This is animation sequence is defined as a separate function to avoid excessive indentation
            run_trial(this.stim);

        },

        // Continue to next slide
        continue_button : function() {

            _stream.apply(this);

        },

        submit_data_button : function() {

            // No response on slider -> error
            if ((this.stim.response_type == "slider") && (exp.sliderPost == null)) {
                $(".slider_error").show();
            } else {

                 // TODO: implement data-logging!
                _stream.apply(this);

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
            $(".progress").hide();

            // Logs data to Prolific
            exp.data = {
                catch_trials: exp.catch_trials,
                condition: exp.condition,
                trials_stimuli_full: exp.trials_stimuli_full, // What is displayed to the user (unflattened)
                trials_stimuli_streamlined: exp.trials_stimuli_streamlined, // What is displayed to the user (flattened)
                trials_response_data: exp.trials_response_data, // What the user responds (times and sliders) for the main trials
                system: exp.system,
                followup_response_data: exp.followup_response_data, // What the user responds for the followup questions
                subject_information: exp.subj_data,
                total_time_in_seconds: (Date.now() - exp.startT) / 1000
            };

            // Delay sending data to proliferate for 1000 ms
            proliferate.submit(exp.data);
        }
    });

    return slides;

}



//////////////////////////////////////////
// INIT AND SETUP ////////////////////////
//////////////////////////////////////////

function init() {

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
    exp.structure=[ // TODO: uncomment below experiment blocks
        // "i0",
        // "botcaptcha",
        // "sound_check",
        "introduction",
        "trials",
        // "followup", // TODO: add followup as separate section of slides
        "subj_info",
        "thanks"
    ];

    // Used to run present_handle
    exp.trials_stimuli = [];

    // Used to submit to Prolific — very complete data, not flattened
    exp.trials_stimuli_full = [{}]; // Initialized empty so slide_num 0 (introduction) data can be filled in later

    // Used to submit to Prolific — streamlined and flattened
    exp.trials_stimuli_streamlined = [{}]; // Initialized with empty {} so slide_num 0 (introduction) can be filled in later

    // Used to submit to Prolific — contains user slider responses and times for main trials
    exp.trials_response_data = [];

    // Used to submit to Prolific — contains followup "trial" response data
    exp.followup_response_data = [];

    // TODO: implement data-logging!

    slide_num = 1

    let article = " another ";
    if (item_presentation_condition[0].includes("generic")) {
        article = " a ";
    }

    let prompt = "Imagine that you come across" + article + item_name[0][0] + ". What are the chances that it has " + objects[0][2] + "?";
    if (objects[0][2] == "squeaking") {
        prompt = "Imagine that you come across" + article + item_name[0][0] + ". What are the chances that it squeaks?";
    }

    exp.trials_stimuli = exp.trials_stimuli.concat([

        _.extend(
            {
                slide_num: slide_num++,
                type: "agent_intro",
                item_presentation_condition: item_presentation_condition[0],
                background: back[0],
                agent: agents[0],
                speaker: speakers[0]
            }
        ),

        _.extend(
            {
                slide_num: slide_num++,
                type: "object_encounter",
                item_presentation_condition: item_presentation_condition[0],
                background: back[0],
                agent: agents[0],
                speaker: speakers[0],
                object: objects[0],
                item_name: item_name[0],
                n_examples: n_examples[0]
            }
        ),

        _.extend(
            {
                slide_num: slide_num++,
                type: "object_property",
                item_presentation_condition: item_presentation_condition[0],
                background: back[0],
                agent: agents[0],
                speaker: speakers[0],
                object: objects[0],
                item_name: item_name[0],
                n_examples: n_examples[0]
            }
        ),

        _.extend(
            {
                slide_num: slide_num++,
                type: "followup",
                prompt: prompt,
                correct_answer: "NA",
                show_scene: false,
                show_generic: false,
                response_type: "slider",
                slider_label_l: "0% (impossible)",
                slider_label_r: "100% (certain)",
                item_presentation_condition: item_presentation_condition[0],
                n_examples: n_examples[0]
            }
        )

    ]);

    // Initialize data frames to be submitted to Prolific — data will be added as slides are run
    exp.catch_trials = [];
    exp.followup_data = [];
    exp.condition = {
        item_presentation_condition: item_presentation_condition[0],
        n_examples: n_examples
    };

    console.log(exp.condition);

    exp.slides = make_slides(exp);
    exp.nQs = utils.get_exp_length();

    $(".slide").hide(); //hide everything

    exp.startT = Date.now();
    exp.go();

}