// OUTLINE OF OF experiment.js FILE:
// 1) Variable declarations
// 2) Helper functions
// 3) Main program
// 4) Init and setup



//////////////////////////////////////////
// VARIABLE DECLARATIONS /////////////////
//////////////////////////////////////////

var back =              _.shuffle( [1,2,3,4,5,6,7,8,9,10] ); // Background images
var agents =            _.shuffle( ["Elephant","Monkey","Dog","Bear","Tiger","Sheep"] );
var speakers =          _.shuffle( ["mh", "tg", "sb"] );
var audio_version =     "fall-2020-v2";

var artifacts =         _.shuffle([ ["artifact", "artifact01", "squeaking"], ]);
var flowers =           _.shuffle([ ["flower", "flower01", "purple petals"] ]);
var birds =             _.shuffle([ ["bird", "bird02", "green feathers"] ]);
var objects =           _.shuffle([ birds[0], flowers[0], artifacts[0] ]);

var item_names =         _.shuffle([ ["wug", "wugs"], ["dax", "daxes"], ["fep", "feps"] ]);
var n_examples =        _.shuffle([2]);
var item_presentation_condition = _.shuffle(["accidental"]);

var distractor_names = _.shuffle(["zobby", "vicket", "yem", "blus", "nar"])
var grid_name_labels = _.shuffle( $.merge( distractor_names, [item_names[0][0]] ) );

console.log(item_presentation_condition[0] + ", " + n_examples[0] + " " + objects[0][0] + " (\"" + item_names[0][0] + "\")");
console.log(agents[0] + ", voiced by " + speakers[0]);



//////////////////////////////////////////
// HELPER FUNCTIONS //////////////////////
//////////////////////////////////////////

let agent_from_right = 250; // agent's initial, intro slide distance from the right
let agent_travel_distance = 140; // distance agent moves to the right to trigger object property reveal

// Change all images of a given class to have the same source
function change_image(class_name, source) {
    changing_images = document.getElementsByClassName(class_name);
    for (var i=0; i<changing_images.length; i+=1) {
        changing_images[i].src = source;
    }

}

// Display text in speech bubble and log data to Prolific
function agent_say(display_text, slide_num, width=400, duration=2000) {

    let deferred = new $.Deferred();

    $(".speech").show();
    $("#speech-bubble").text(display_text);
    $("#speech-bubble").width(width);

    // log spoken text to be sent to Prolific)
    exp.full_trials_stimuli[0]["spoken_text"].push(
        {
            text: display_text,
            slide_num: slide_num,
            duration: duration
        }
    );

    setTimeout (function() {
        deferred.resolve();
    }, duration);

    return deferred.promise();

}

// Display scene with agent and objects
function set_agent_object_scene(stim, fade=true) {

    let deferred = new $.Deferred();

    let fade_in_duration = 1750;
    let fade_out_duration = 1750;
    if (!fade) {
        fade_in_duration = 0;
        fade_out_duration = 0;
    }

    let fade_in_tags = "#background, #" + stim.agent;

    $(".speech").hide();
    $("#speech-bubble").css("left", "5px");
    $(".agent_intro, #background, #" + stim.agent).fadeOut(fade_out_duration, complete=function() {

            let new_agent_from_right = agent_from_right + 200
            $(".agent").css("right", new_agent_from_right + "px");
            $(".agent").css("height", "250px");

            $(".speech").css("top", "+=25px");
            $("#speech-bubble-tail, #speech-bubble-outline").css("left", "-=85px");

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
                $(".label").css("left", "+=12px");
                $(".object").css("right", "-=12px");
            }

            $(fade_in_tags).fadeIn(fade_in_duration);

        }

    )

    setTimeout (function() {
        deferred.resolve();
    }, fade_in_duration + fade_out_duration);

    return deferred.promise();

}

// Reveal property for object with given number
function show_object_property(stim, object_num) {

    let deferred = new $.Deferred();

    if (stim.object[0] == "artifact") {

        squeak = new Audio("audio/squeak.mp3");
        squeak.play();

        // Object compresses and decompresses
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

// Reveal all objects' properties, staggered
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
    }, total_wait_time + 1000 + 250*stim.n_examples); // extra time accounts for browser delay

    return deferred.promise();

}

// Run animation or followup question given by stim
function run_trial(stim) {

    $(".continue_button").hide();

    if (stim.type == "agent_intro") {

        $(".agent, .object, #tree, #dirt, #table, .label, #followup, #title, #trials_text").hide();
        $("#background").attr("src", "images/back" + stim.background + ".jpg");
        $(".agent_intro, #" + stim.agent).show();

        $(".agent").css("right", agent_from_right + "px");
        $("#speech-bubble-tail, #speech-bubble-outline").css("left", 475 - agent_from_right + "px");

        if (stim.item_presentation_condition == "accidental") {

            let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/just_arrived.wav");
            sound.play()

            agent_say("Hello! I am a new researcher. I just arrived on this planet.", slide_num=stim.slide_num, width=425, duration=5500).then(

                function() {

                    let deferred = new $.Deferred();

                    agent_say("I don't know anything about the animals, plants, or objects here.", slide_num=stim.slide_num, width=475, duration=6000);

                    let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/idk_anything.wav");
                    sound.play()

                    setTimeout (function() {
                        deferred.resolve();
                    }, 6000);

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

            let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/been_while.wav");
            sound.play()

            agent_say("Hello! I've been doing research on this planet for a while.", slide_num=stim.slide_num, width=425, duration=5525).then(

                function() {

                    let deferred = new $.Deferred();

                    agent_say("I know all about the animals, plants, and objects here.", slide_num=stim.slide_num, width=400, duration=5550);

                    let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/i_know_all.wav");
                    sound.play()

                    setTimeout (function() {
                        deferred.resolve();
                    }, 6000);

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

                    agent_say("Hmm, I wonder what we have here.", slide_num=stim.slide_num, width=260, duration=3500);
                    let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/hmm_i_wonder.wav");
                    sound.play()

                    setTimeout (function() {
                        deferred.resolve();
                    }, 4000);

                    return deferred.promise();

                }

            ).then(

                function() {

                    let deferred = new $.Deferred();

                    let bubble_width = 210;
                    let audio_file_name = "oh_" + stim.item_name[1];
                    let statement = "Oh, I see! These are " + stim.item_name[1] + ".";

                    if (stim.n_examples == 1) {
                        statement = "Oh, I see! This is a " + stim.item_name[0] + ".";
                        audio_file_name = "oh_" + stim.item_name[0];
                        bubble_width -= 25;
                    }

                    agent_say(statement, slide_num=stim.slide_num, width=bubble_width, duration=4000);

                    let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/" + audio_file_name + ".wav");
                    sound.play()

                    setTimeout (function() {
                        deferred.resolve();
                    }, 4000);

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

            let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/show_you.wav");
            sound.play();

            agent_say("I have something to show you. Follow me!", slide_num=stim.slide_num, width=325, duration=4250).then(

                function() {

                    let deferred = new $.Deferred();

                    set_agent_object_scene(stim);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 3500);

                    return deferred.promise();
                }

            ).then(

                function() {

                    let deferred = new $.Deferred();

                    let bubble_width = 125;
                    let audio_file_name = "these_" + stim.item_name[1];
                    let statement = "These are " + stim.item_name[1] + ".";

                    if (stim.n_examples == 1) {
                        statement = "This is a " + stim.item_name[0] + ".";
                        audio_file_name = "this_" + stim.item_name[0];
                        bubble_width -= 25;
                    }

                    agent_say(statement, slide_num=stim.slide_num, width=bubble_width, duration=2000);

                    let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/" + audio_file_name + ".wav");
                    sound.play()

                    setTimeout (function() {
                        deferred.resolve();
                    }, 2000);

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

        let agent_animate_duration = 800;

        let speech_bubble_shift_distance = 50;

        if (stim.item_presentation_condition == "accidental") {

            $(".speech").hide();

            $("#" + stim.agent).animate(
                { right: "-=" + agent_travel_distance + "px"},
                agent_animate_duration,
                function() {

                    $("#speech-bubble-tail, #speech-bubble-outline").css("left", "+=" + agent_travel_distance + "px");
                    $("#speech-bubble").css("left", "+=" + speech_bubble_shift_distance + "px");

                    show_all_object_properties(stim).then(

                        function() {

                            let deferred = new $.Deferred();

                            say_text = "Oh wow! ";
                            audio_file_name = "wow_";

                            if (stim.object[0] == "artifact") {
                                say_text += "Squeaking!";
                                audio_file_name += "squeaking";
                            } else {

                                say_text += stim.object[2].charAt(0).toUpperCase() + stim.object[2].slice(1) + "!";

                                if (stim.object[2] == "purple petals") {
                                    audio_file_name += "purple_petals";

                                } else if (stim.object[2] == "green feathers") {
                                    audio_file_name += "green_feathers";
                                }

                            }

                            sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/" + audio_file_name + ".wav");
                            sound.play();

                            agent_say(say_text, slide_num=stim.slide_num, width=200, duration=3500);

                            setTimeout (function() {
                                deferred.resolve();
                            }, 3500);

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

            let sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/watch_this.wav");
            sound.play()

            agent_say("Watch this!", slide_num=stim.slide_num, width=90, duration=2000).then(

                function() {

                    $(".speech").hide();

                    $("#" + stim.agent).animate(
                        { right: "-=" + agent_travel_distance + "px"},
                        agent_animate_duration,
                        function() {

                            $("#speech-bubble-tail, #speech-bubble-outline").css("left", "+=" + agent_travel_distance + "px");
                            $("#speech-bubble").css("left", "+=" + speech_bubble_shift_distance + "px");

                            show_all_object_properties(stim).then(

                                function() {

                                    let deferred = new $.Deferred();

                                    let audio_file_name = "see_";
                                    let bubble_width = 150;

                                    say_text = "See? ";

                                    if (stim.object[0] == "artifact") {
                                        say_text += "Squeaking!";
                                        audio_file_name += "squeaking";
                                    } else {

                                        say_text += stim.object[2].charAt(0).toUpperCase() + stim.object[2].slice(1) + "!";

                                        if (stim.object[2] == "purple petals") {
                                            audio_file_name += "purple_petals";

                                        } else if (stim.object[2] == "green feathers") {
                                            audio_file_name += "green_feathers";
                                            bubble_width += 25;
                                        }

                                    }

                                    sound = new Audio("audio/" + stim.speaker + "_recordings/" + audio_version + "/" + audio_file_name + ".wav");
                                    sound.play();

                                    agent_say(say_text, slide_num=stim.slide_num, width=bubble_width, duration=3000);

                                    setTimeout (function() {
                                        deferred.resolve();
                                    }, 3000);

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

    if (stim.type == "followup") {

        $("#followup, #trials_text, #title").show();
        $("#animation_container, #generic_text, .error, .slider, .grid, .mc, #freeform").hide();
        $("#trials_text").text(stim.prompt);

        if (stim.show_scene) {

            $("#" + stim.agent).css("right", agent_from_right);
            set_agent_object_scene(stim, fade=false)
            $("#animation_container").show();

        }

        if (stim.show_generic) {

            $(".agent, .object, .error, .speech, .blanket, .label, .table, .background, .slider, .continue_button").hide();

            let generic_statement = stim.item_name[1][0].toUpperCase() + stim.item_name[1].slice(1) + " have " + stim.property;
            if (stim.property == "squeaking") {
                generic_statement = stim.item_name[1][0].toUpperCase() + stim.item_name[1].slice(1) + " squeak";
            }

            $("#generic_text").text("\"" + generic_statement + ".\"");
            $("#generic_text").show();

        }

        if (stim.response_type == "slider") {

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

            $(".grid").show();

            let counter;
            for (counter=1; counter <= grid_name_labels.length; counter++) {
                $("#grid_label" + counter).text(stim.grid_labels[counter-1]);
                $("#grid_choice" + counter).attr("value", stim.grid_labels[counter-1]);
            }

        }

        if (stim.response_type == "freeform") {

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

    // Introduction slide with general experiment and lab info
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
                    exp.full_response_data.push({
                        type: "attention",
                        prompt: this.bot_utterance + " " + this.bot_question,
                        correct_answer: listener,
                        num_fails: this.bot_trials,
                        responses: this.all_responses,
                        duration: (Date.now() - this.botcaptcha_startT) / 1000
                    });

                    exp.streamlined_data["catch_trial_fails"] += this.bot_trials;

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
                    exp.full_response_data.push({
                        type: "attention",
                        prompt: "Please adjust your system volume to a comfortable level. When you are ready, click the Test button. You will hear a word like \"skyscraper\". Enter the word you hear into the box below and click Continue\ when you are finished.",
                        correct_answer: this.sound_word,
                        num_fails: this.sound_trials,
                        responses: this.all_responses,
                        duration: (Date.now() - this.sound_startT) / 1000
                    });

                    exp.streamlined_data["catch_trial_fails"] += this.sound_trials;

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

            exp.full_response_data.push(
                {
                    type: "introduction",
                    duration: (this.intro_endT - this.intro_startT) / 1000
                }
            )

            // Continue to next slide
            exp.go();
        }

    });

    // Run experiment
    slides.trials = slide({

        name : "trials",
        present: exp.trials_stimuli,

        present_handle : function(stim) {

            this.startT = Date.now();

            this.stim = stim;

            exp.full_trials_slides.push(this.stim);

            // defined as a separate function to avoid excessive indentation
            run_trial(this.stim);

        },

        // Continue to next slide
        continue_button : function() {

            _stream.apply(this);

        },

        submit_data_button : function() {

            // If no response, display error
            if ((this.stim.response_type == "slider") && (exp.sliderPost == null)) {
                $("#slider_error").show();
            } else if ((this.stim.response_type == "grid") && (!($("input[name='grid_choice']").is(":checked")))) {
                $("#grid_error").show();
            } else if ((this.stim.response_type == "mc") && (!($("input[name='mc_choice']").is(":checked")))) {
                $("#mc_error").show();
            } else if ((this.stim.response_type == "freeform") && ($("textarea#freeform").val() == "")) {
                $("#freeform_error").show();

            // If response, log response data
            } else {
                this.duration = (Date.now() - this.startT) / 1000;

                // collect response
                if (this.stim.response_type == "slider") {
                    this.response = exp.sliderPost;
                    exp.streamlined_data["predicted_probability"] = this.response;
                    exp.streamlined_data["predicted_probability_duration"] = this.duration;

                } else if (this.stim.response_type == "grid") {
                    this.response = $("input[name=grid_choice]:checked").val();

                } else if (this.stim.response_type == "mc") {
                    this.response = $("input[name=mc_choice]:checked").val();

                    if (this.stim.show_generic) {
                        exp.streamlined_data["generic_endorsement"] = this.response;
                        exp.streamlined_data["generic_endorsement_duration"] = this.duration;
                    }

                    if ( (this.stim.show_scene) && ( (this.response == "yes") || (this.response == "no") ) ) {
                        exp.streamlined_data["perceived_character_knowledge"] = this.response;
                        exp.streamlined_data["perceived_character_knowledge_duration"] = this.duration;
                    }

                } else if (this.stim.response_type == "freeform") {
                    this.response = $("#freeform").val();
                    exp.streamlined_data["freeform_followup"] = this.response;
                    exp.streamlined_data["freeform_followup_duration"] = this.duration;

                }

                // Checks if the user response is correct
                if (this.stim.correct_answer == "NA") {
                    this.is_correct = true; // For simplicity, slider and freeform responses are always considered "right"
                } else {
                    this.is_correct = (this.response == this.stim.correct_answer);
                }

                if (!(this.is_correct)) {
                    exp.streamlined_data["followup_fails"]++;
                }

                // Log followup duration and slider response to Prolific
                exp.full_response_data.push(
                    {
                        prompt: this.stim.prompt,
                        response: this.response,
                        response_type: this.stim.response_type,
                        correct_answer: this.stim.correct_answer,
                        is_correct: this.is_correct,
                        duration: this.duration
                    }
                );

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
            exp.go();
        }

    });

    slides.thanks = slide({
        name : "thanks",
        start : function() {

            // Hide progress bar
            $(".progress").hide();

            // Logs data to Prolific
            exp.data = {
                streamlined_data: exp.streamlined_data,
                full_response_data: exp.full_response_data, // contains user response from attention checks and followup question data
                full_trials_stimuli: exp.full_trials_stimuli, // detailed items displayed to users
                full_trials_slides: exp.full_trials_slides, // slides to run animated experiment and followup
                system: exp.system,
                subject_information: exp.subj_data
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
    exp.structure=[
        "i0",
        "botcaptcha",
        "sound_check",
        "introduction",
        "trials", // includes animations as well as followup questions
        "subj_info",
        "thanks"
    ];

    let environment_name;
    if (objects[0][0] == "bird") {
        environment_name = "tree";
    } else if (objects[0][0] == "artifact") {
        environment_name = "table";
    } else if (objects[0][0] == "flower") {
        environment_name = "dirt";
    }

    // Form grammatically correct followup statements
    let has_property_statement = "has " + objects[0][2];
    let could_have_property_statement = "could have " + objects[0][2];
    if (objects[0][2] == "squeaking") {
        has_property_statement = "squeaks";
        could_have_property_statement = "could squeak";
    }

    // Set correct answer for attention check follow based on character arrival
    let character_arrival = "been_while";
    if (item_presentation_condition[0] == "accidental") {
        character_arrival = "just_arrived";
    }

    // Create stim (~ slides) to run experiment
    let slide_num = 1;
    exp.trials_stimuli = [

        // Animated agent introduces self
        {
            slide_num: slide_num++,
            type: "agent_intro",
            item_presentation_condition: item_presentation_condition[0],
            background: back[0],
            agent: agents[0],
            speaker: speakers[0]
        },

        // Animated agent encounters object(s)
        {
            slide_num: slide_num++,
            type: "object_encounter",
            item_presentation_condition: item_presentation_condition[0],
            background: back[0],
            agent: agents[0],
            speaker: speakers[0],
            object: objects[0],
            item_name: item_names[0],
            n_examples: n_examples[0]
        },

        // Animated agent discovers property of object(s)s
        {
            slide_num: slide_num++,
            type: "object_property",
            item_presentation_condition: item_presentation_condition[0],
            background: back[0],
            agent: agents[0],
            speaker: speakers[0],
            object: objects[0],
            item_name: item_names[0],
            n_examples: n_examples[0]
        },

        // Followup for likelihood of next encountered object to have same property (predicted probability)
        {
            slide_num: slide_num++,
            type: "followup",
            prompt: "Imagine that you come across another " +item_names[0][0] + ". What are the chances that it " + has_property_statement + "?",
            correct_answer: "NA",
            show_scene: false,
            show_generic: false,
            response_type: "slider",
            slider_label_l: "0% (impossible)",
            slider_label_r: "100% (certain)",
            item_presentation_condition: item_presentation_condition[0],
            n_examples: n_examples[0]
        },

        // Followup for learned object name recognition from grid of distractors
        {
            slide_num: slide_num++,
            type: "followup",
            prompt: "What is the name of the item you learned about? Please select its name from the options below.",
            correct_answer: item_names[0][0],
            show_scene: false,
            show_generic: false,
            response_type: "grid",
            grid_labels: grid_name_labels,
            item_presentation_condition: item_presentation_condition[0]
        },

        // Followup for perceived strength of inference for generic (generic endorsement)
        {
            slide_num: slide_num++,
            type: "followup",
            prompt: "Would you say the following is true?",
            correct_answer: "NA",
            show_scene: false,
            show_generic: true,
            property: objects[0][2],
            item_name: item_names[0],
            response_type: "mc",
            options: [ ["Yes", "yes"], ["No", "no"] ],
            item_presentation_condition: item_presentation_condition[0]
        },

        // Followup for inferred character knowledge before object encounter and property reveal
        {
            slide_num: slide_num++,
            type: "followup",
            prompt: "Please refer to the image below. Did this character know that " + item_names[0][1] + " " + could_have_property_statement + " before you observed it together?",
            correct_answer: "NA",
            show_scene: true,
            show_generic: false,
            agent: agents[0],
            background: back[0],
            object: objects[0],
            item_name: item_names[0],
            n_examples: n_examples[0],
            response_type: "mc",
            options: [ ["Yes", "yes"], ["No", "no"] ],
            item_presentation_condition: item_presentation_condition[0]
        },

        // Followup (~ attention check) for character arrival
        {
            slide_num: slide_num++,
            type: "followup",
            prompt: "Please refer to the image below. Is this character a new researcher who just arrived here, or have they been doing research on this planet for a while?",
            correct_answer: character_arrival,
            show_scene: true,
            show_generic: false,
            agent: agents[0],
            background: back[0],
            object: objects[0],
            item_name: item_names[0],
            n_examples: n_examples[0],
            response_type: "mc",
            options: [ ["This character is a new researcher who just arrived here", "just_arrived"], ["This character has been doing research on this planet for a while", "been_while"] ],
            item_presentation_condition: item_presentation_condition[0]
        },

        // Followup freeform response to gauge data quality
        {
            slide_num: slide_num++,
            type: "followup",
            prompt: "In the text box below, please describe briefly what happened in this experiment.",
            correct_answer: "NA",
            show_scene: false,
            show_generic: false,
            response_type: "freeform",
            item_presentation_condition: item_presentation_condition[0]
        }

    ];

    // flattened file containing all info needed for data analysis
    exp.streamlined_data = {
        item_presentation_condition: item_presentation_condition[0],
        n_examples: n_examples[0],
        object: objects[0][0],
        item_name: item_names[0][0],
        agent: agents[0],
        speaker: speakers[0],
        catch_trial_fails: 0,
        followup_fails: 0,
        predicted_probability: null,
        predicted_probability_duration: 0,
        generic_endorsement: null,
        generic_endorsement_duration: 0,
        perceived_character_knowledge: null,
        perceived_character_knowledge_duration: 0,
        freeform_followup: "",
        freeform_followup_duration: 0
    };

    // Submitted to Prolific — very complete data, not flattened
    exp.full_trials_stimuli = [
        {
            item_presentation_condition: item_presentation_condition[0],
            n_examples: n_examples[0],
            agent: {
                name: agents[0],
                image: agents[0] + "_straight.png"
            },
            object: {
                name: objects[0][0],
                closed_image: objects[0][1] + "_closed.svg",
                open_image: objects[0][1] + "_open.svg",
                property: objects[0][2]
            },
            item_name: {
                singular: item_names[0][0],
                plural: item_names[0][1]
            },
            environment: {
                name: environment_name,
                image: environment_name + ".svg"
            },
            speaker: speakers[0],
            background: back[0],
            spoken_text: []
        }
    ];

    exp.full_trials_slides = [];

    exp.full_response_data = [];

    exp.slides = make_slides(exp);
    exp.nQs = utils.get_exp_length();

    $(".slide").hide(); //hide everything

    exp.startT = Date.now();
    exp.go();

}