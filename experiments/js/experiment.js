// Experiment variables and randomization
var total_trials_num =  3;

var back =              _.shuffle([1,2,3,4,5,6,7,8,9,10]);
var agents =            _.shuffle(["Elephant","Pig","Monkey","Dog","Bear","Tiger","Cat","Sheep"]); // Bunny, Beaver, Frog, and Mouse excluded due to difference from mean width
var speakers =          _.shuffle(["mh", "tg", "sb"]);

var artifacts =         _.shuffle([ ["artifact", "artifact01", "squeaking"], ]);
var flowers =           _.shuffle([ ["flower", "flower01", "purple petals"] ]);
var birds =             _.shuffle([ ["bird", "bird02", "green feathers"] ]);
var objects =           _.shuffle([ artifacts[0], flowers[0], birds[0]]);

var item_name =         _.shuffle([ ["fep", "feps"], ["dax", "daxes"], ["blicket", "blickets"] ]);
var n_examples =        [2]; // Should be "_.shuffle([1, 2, 3, 4]);" for future, non-pilot trials
var item_presentation_condition = _.shuffle(["accidental", "pedagogical"]);

function change_image(class_name, source) {
    changing_images = document.getElementsByClassName(class_name);
    for (var i=0; i<changing_images.length; i+=1) {
        changing_images[i].src = source;
    }
}

function agent_straight(agent_class) {
    $(".agent").hide();
    $("."+agent_class+"_straight").show();
}

function agent_point_r(agent_class) {
    $(".agent").hide();
    $("."+agent_class+"_point_r").show();
}

function agent_poke_r(agent_class) {
    let deferred = new $.Deferred();

    $(".speech").hide();
    agent_point_r(agent_class);
    $("."+agent_class+"_point_r").animate(
        { right: "-=30px"},
        { duration: 300}
    );
    $("."+agent_class+"_point_r").animate(
        { right: "+=30px"},
        { duration: 300}
    );

    setTimeout (function() {
        deferred.resolve();
    }, 600);

    return deferred.promise();
}

function agent_say(display_text, trial_num, duration=2000) {
    let deferred = new $.Deferred();

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

function set_table(stim) {
    // Displays objects, blankets, and tags
    let temp_counter = 1;
    while (temp_counter <= stim.n_examples) {
        change_image("closed", "images/" + stim.object[1] + "_closed.svg");
        change_image("open", "images/" + stim.object[1] + "_open.svg");

        $(".object" + temp_counter + ".closed").show();
        $(".blanket" + temp_counter + ".blanket_up").show();
        $(".label" + temp_counter).show();
        $(".label" + temp_counter).text(stim.item_name[0].toUpperCase());

        temp_counter += 1;
    };

    // Adjusts object display based on stimulus
    $(".object1").css("right", "275px");
    $(".object2").css("right", "202px");
    $(".object3").css("right", "129px");
    $(".object4").css("right", "56px");
    $(".object").css("height", "85.5px");
    $(".object").css("width", "auto");
}

function poke_blanket_fall(stim) {

    let deferred = new $.Deferred();

    // Agent prods line of object(s)
    agent_poke_r(stim.agent).then(
            
        // Blanket drops
        function() {

            let temp_counter = stim.exemplar_num;

            $(".label" + temp_counter).fadeOut(600);
            $(".blanket" + temp_counter + ".blanket_up").fadeOut(600);
            $(".blanket" + temp_counter + ".blanket_down").fadeIn(600);
        
        }
    )

    setTimeout (function() {
        deferred.resolve();
    }, 1000);

    return deferred.promise();
}

function effect(stim) {
    let deferred = new $.Deferred();
    
    if (stim.object[0] == "artifact") {
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
            gliss_up = new Audio("audio/bird_chirp.mp3");
        } else if (stim.object[0] == "flower") {
            gliss_up = new Audio("audio/gliss_up.mp3");
        }
        
        gliss_up.play();
        $(".object" + stim.exemplar_num + ".closed").fadeOut(600);
        $(".object" + stim.exemplar_num + ".open").fadeIn(600);

    }

    setTimeout (function() {
        deferred.resolve();
    }, 1000);

    return deferred.promise();
}

function effect_remark_close(stim) {
    
    effect(stim).then(

        // Agent remarks on "open" object property
        function() {
            let deferred = new $.Deferred();

            agent_straight(stim.agent);
            
            let delay_time = 2500;
            let audio_file_name = "";

            let say_text = "";
            if (stim.item_presentation_condition == "accidental") {
                say_text += "Oh wow! ";
                audio_file_name += "oh_wow_";
            } else if (stim.item_presentation_condition == "pedagogical") {
                say_text += "See? ";
                audio_file_name += "see_";
                delay_time = 2250;
            }
            if (stim.object[0] == "artifact") {
                say_text += "Squeaking!";
                audio_file_name += "squeaking";
                delay_time = 2250;
            } else {
                say_text += stim.object[2].charAt(0).toUpperCase() + stim.object[2].slice(1) + "!";
                if (stim.object[2] == "purple petals") {
                    audio_file_name += "purple_petals";
                } else if (stim.object[2] == "green feathers") {
                    audio_file_name += "green_feathers";
                }
            }

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
            
            if (stim.object[0] == "artifact") {
                let temp_counter = stim.exemplar_num;
                $(".object" + temp_counter + ".closed").fadeIn(10);
                deferred.resolve();
            } else {
            
                let temp_counter = stim.exemplar_num;
                $(".object" + temp_counter + ".open").fadeOut(600);
                $(".object" + temp_counter + ".closed").fadeIn(600);

                setTimeout (function() {
                    deferred.resolve();
                }, 600);
            }

            return deferred.promise();
        }
    ).then(

        // Continues to next
        function() {
            $(".continue_button1").show();
        }
    );
}

function run_trial(stim, exp_this) {

    $("button").hide();
    $(".object, .error, .speech, .slider, .blanket, .label").hide();

    $(".table, .background").show();

    // Agent greets user
    if (stim.type == "greeting") {
        agent_straight(stim.agent);
        change_image("background", "images/back" + stim.background + ".jpg");    
        
        $(".speech-bubble").css("left", "10px");
        $(".speech-bubble-tail, .speech-bubble-outline").css("right", "475px");
        
        // Greeting text and audio (under 2000 ms)
        let greeting = "";
        if (stim.item_presentation_condition == "pedagogical") {
            greeting += "Hello! I've been here for a while.";
            hello = new Audio("audio/" + stim.speaker + "_recordings/hello_ive_been_here.mp3");
            hello.play();
        } else if (stim.item_presentation_condition == "accidental") {
            greeting += "Hello! I just arrived here.";
            hello = new Audio("audio/" + stim.speaker + "_recordings/hello_i_just_arrived.mp3");
            hello.play();
        }

        agent_say(greeting, stim.trial_num, 2250).then(
            function() {
                $(".continue_button1").show();
            }
        );

    // Agent remarks on objects (number and name) on table
    } else if (stim.type == "lookit") {
        
        set_table(stim);

        let lookit = "";
        let wait_time = 3000;

        if (stim.n_examples > 1) {
            lookit = "There are " + stim.n_examples + " " + stim.item_name[1] + " on the table.";
            there_on_table = new Audio("audio/" + stim.speaker + "_recordings/" + stim.n_examples + "_" + stim.item_name[1] + ".mp3");
        } else {
            lookit = "There is " + stim.n_examples + " " + stim.item_name[0] + " on the table.";
            there_on_table = new Audio("audio/" + stim.speaker + "_recordings/" + stim.n_examples + "_" + stim.item_name[0] + ".mp3");
        }

        if (stim.item_presentation_condition == "accidental") {
            lookit = "Oh! Look at that! " + lookit;
            oh_look = new Audio("audio/" + stim.speaker + "_recordings/oh_look_at_that.mp3");
            
            oh_look.play();

            wait_time += 1750;
            
            setTimeout (function() {
                there_on_table.play();
            }, 1750)

        } else {
            there_on_table.play();
        }

        agent_say(lookit, stim.trial_num, wait_time);

        setTimeout (function() {
            _stream.apply(exp_this);
        }, wait_time);

    // Trial
    } else if (stim.type == "trial") {
        
        set_table(stim);

        if (stim.object[0] == "bird") {
        $(".object1.open").css("right", "219px");
        $(".object2.open").css("right", "146px");
        $(".object3.open").css("right", "73px");
        $(".object4.open").css("right", "0px");
        } else if (stim.object[0] == "flower") {
            $(".open").css("height", "95.5px");
        }

        // Previously shown objects are still displayed
        temp_counter = 1;
        while (temp_counter < stim.exemplar_num) {
            change_image("closed", "images/" + stim.object[1] + "_closed.svg");
            $(".blanket" + temp_counter + ".blanket_up").hide();
            $(".blanket" + temp_counter + ".blanket_down").show();
            $(".label" + temp_counter).hide();
            temp_counter += 1;
        };

        let agent_right_val = (360 - (stim.exemplar_num - 1)*73) + "px";
        let speech_bubble_val = (10 + (stim.exemplar_num -1)*73) + "px";
        let speech_tail_val = (475 - (stim.exemplar_num - 1)*73) + "px";

        // Agent and speech bubble position adjust to active object
        $("." + stim.agent + "_straight").css("right", agent_right_val);
        $("." + stim.agent + "_point_r").css("right", agent_right_val);
        $(".speech-bubble").css("left", speech_bubble_val);
        $(".speech-bubble-tail").css("right", speech_tail_val);
        $(".speech-bubble-outline").css("right", speech_tail_val);

        if (stim.item_presentation_condition == "accidental") { // Accidental item presentation

            poke_blanket_fall(stim).then(
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
                function() {
                    $(".speech").hide();
                    effect_remark_close(stim);
                }
            );

        } else if (stim.item_presentation_condition == "pedagogical") { // Pedagogical item presentation

            show_you = new Audio("audio/" + stim.speaker + "_recordings/let_me_show_you_something.mp3");
            show_you.play();

            agent_say("Let me show you something.", stim.trial_num, 2000).then(
                function() {
                    let deferred = new $.Deferred();

                    poke_blanket_fall(stim);

                    setTimeout (function() {
                        deferred.resolve();
                    }, 1200);

                    return deferred.promise();
                }
            ).then(
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
                function() {
                    $(".speech").hide();
                    effect_remark_close(stim);
                }
            );
        }
    }
}

// MAIN PROGRAM BEGINS HERE! :)
function make_slides(f) {
    var slides = {};

    slides.i0 = slide({
        name : "i0",
    });

    // simple language comprehension check to include at beginning of experiment
    slides.botcaptcha = slide({
        name : "botcaptcha",
        bot_trials : 0,
        all_responses: [],
        start: function() {

            this.botcaptcha_startT = Date.now();

            $(".error").hide();
            // list of speaker names to be sampled from
            speaker = _.sample(["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"]);
            // list of listener names to be sampled from
            listener = _.sample(["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Margaret"]);
            // create the utterance
            this.bot_utterance = speaker + " says to " + listener + ": \"It's a beautiful day, isn't it?\""
            // creat ethe question
            this.bot_question = "Who is " + speaker + " talking to?"
            // append the utterance and the question to the view
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

            if (bot_response.toLowerCase() == "") {
                $(".error_incorrect").hide();
                $(".write_something").show();
            } else {
                this.all_responses.push(bot_response);
                if (bot_response.toLowerCase() == listener.toLowerCase()) {
                
                // Log data to MTurk
                exp.catch_trials.push({
                    trial_type: "botcaptcha",
                    correct_answer: listener,
                    num_fails: this.bot_trials,
                    responses: this.all_responses,
                    trial_time_in_seconds: (Date.now() - this.botcaptcha_startT) / 1000
                });

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
                        // if participant fails, they cannot proceed
                        $(".error, #sound_button, #sound_test_button, .progress").hide();
                        $('#sound_response').prop("disabled", true);
                        $(".error_final").show();
                    }
                }
            }
        }
    });

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
            
            if (sound_response.toLowerCase() == "") {
                $(".error_incorrect").hide();
                $(".write_something").show();
            } else {
                this.all_responses.push(sound_response);
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

    slides.introduction = slide({
        name : "introduction",
        start: function() {
            this.intro_startT = Date.now();
        },
        button : function() {
            this.intro_endT = Date.now();

            _.extend(exp.trials_stimuli_full[0],
                {
                    trial_num: 0, // Introduction
                    trial_type: "introduction",
                    trial_time_in_seconds: (this.intro_endT - this.intro_startT) / 1000,
                    display_text: "You are a scientist being deployed to a remote field site. Your job is to catalogue and describe new kinds of plants, animals, and objects that have been discovered on the planet. When you arrive at the field site, you meet other scientists there."
                }
            );

            _.extend(exp.trials_stimuli_streamlined[0],
                {
                    trial_num: 0, // Introduction
                    trial_type: "introduction",
                    trial_time_in_seconds: (this.intro_endT - this.intro_startT) / 1000
                }
            );

            exp.go();
        }
    });

    slides.trials = slide({
        name : "trials",
        present: exp.trials_stimuli,
        start: function() {
            // Included here so start time is not reset with each subtrial within each trial
            this.trials_startT = Date.now();
        },
        present_handle : function(stim) {

            this.stim = stim;
            run_trial(this.stim, this);

            // Capture user response (prediction)
            if (this.stim.type == "response") {
                $(".agent, .object, .error, .speech, .blanket, .label, .table, .background").hide();

                $(".slider").show();

                if (this.stim.object[0] == "artifact") {
                    $(".prompt").text("Imagine that you have another " + this.stim.item_name[0] + ". What do you think would be the likelihood that it squeaks?");
                } else {
                    $(".prompt").text("Imagine that you have another " + this.stim.item_name[0] + ". What do you think would be the likelihood that it has " + this.stim.object[2] + "?");
                }

                this.init_sliders();
                exp.sliderPost = null;

                $(".continue_button2").show();
            };
        },

        continue_button1 : function() {
            _stream.apply(this);
        },

        init_sliders: function() {
            this.trials_slidersT = Date.now();
            utils.make_slider("#single_slider", function(event, ui) {
                exp.sliderPost = ui.value;
            });
        },

        continue_button2 : function() {
            if (exp.sliderPost == null) {
                $(".error").show();
            } else {
                this.trials_endT = Date.now();

                _.extend(exp.trials_stimuli_full[this.stim.trial_num], 
                    {
                        trial_time_in_seconds: (this.trials_slidersT - this.trials_startT) / 1000,
                        slider_response: exp.sliderPost,
                        slider_time_in_seconds: (this.trials_endT - this.trials_slidersT) / 1000
                    }
                );

                _.extend(exp.trials_stimuli_streamlined[this.stim.trial_num], 
                    {
                        trial_time_in_seconds: (this.trials_slidersT - this.trials_startT) / 1000,
                        slider_response: exp.sliderPost,
                        slider_time_in_seconds: (this.trials_endT - this.trials_slidersT) / 1000
                    }
                );

                _stream.apply(this);

                // Resets start time for each trial besides the very first
                this.trials_startT = Date.now();
            }
        }
    });

    slides.subj_info = slide({
        name : "subj_info",
        start: function() {
            $("#submit_button").show();
        },
        submit : function(e){
            //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
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
            $("progress").hide();

            // Logs data to MTurk
            exp.data = {
                condition: exp.condition,
                trials_stimuli_full: exp.trials_stimuli_full,
                trials_stimuli_streamlined: exp.trials_stimuli_streamlined,
                system: exp.system,
                catch_trials: exp.catch_trials,
                subject_information: exp.subj_data,
                total_time_in_seconds: (Date.now() - exp.startT) / 1000
            };
            setTimeout(function() {turk.submit(exp.data);}, 1000);
        }
    });

    return slides;
}

/// init ///
function init() {

    //; support for uniqueturker
    // https://uniqueturker.myleott.com

    /*
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8000", true); // audio/squeak.mp3
    xhr.responseType = "blob";
    var audio = document.querySelector("audio");
    xhr.onload = function() {
        audio.src = URL.createObjectURL(xhr.response);
    };
    xhr.send();
    */

    repeatWorker = false;
    (function(){
            var ut_id = "tg-2020-05-05-genex";
            if (UTWorkerLimitReached(ut_id)) {
                $('.slide').empty();
                repeatWorker = true;
                alert("You have already completed the maximum number of HITs allowed by this requester. Please click 'Return HIT' to avoid any impact on your approval rating.");
            }
    })();

    exp.catch_trials = [];
    exp.condition = {
        item_presentation_condition: item_presentation_condition[0],
        n_examples: n_examples[0]
    }
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
        "trials",
        "subj_info",
        "thanks"
    ];

    // Used to run present_handle
    exp.trials_stimuli = [];

    // Used to submit to MTurk — very complete data, not flattened
    exp.trials_stimuli_full = [{}]; // Initialized with empty {} so trial_num 0 (introduction) can be filled in later

    // Used to submit to MTurk — streamlined and flattened
    exp.trials_stimuli_streamlined = [{}]; // Initialized with empty {} so trial_num 0 (introduction) can be filled in later

    let trial_num = 0;
    while (trial_num < total_trials_num) {

        exp.trials_stimuli = exp.trials_stimuli.concat([ 
            
            // Adds agent greeting slide to trial
            _.extend(
                {
                    trial_num: trial_num + 1,
                    type: "greeting",
                    item_presentation_condition: item_presentation_condition[0],
                    background: back[trial_num],
                    agent: agents[trial_num],
                    speaker: speakers[trial_num]
                }
            ),

            // Adds agent "look at that" slide to trial
            _.extend(
                {
                    trial_num: trial_num + 1,
                    type: "lookit",
                    item_presentation_condition: item_presentation_condition[0],
                    agent: agents[trial_num],
                    object: objects[trial_num],
                    item_name: item_name[trial_num],
                    n_examples: n_examples[0],
                    speaker: speakers[trial_num]
                }
            )
        ]);

        // Creates subtrial for each of the exemplars
        // (This allows the agent to interact with each exemplar object)
        let exemplar_num = 1;
        while (exemplar_num < n_examples[0] + 1) {

            exp.trials_stimuli = exp.trials_stimuli.concat([ 
                _.extend(
                    {
                        trial_num: trial_num + 1,
                        type: "trial",
                        item_presentation_condition: item_presentation_condition[0],
                        agent: agents[trial_num],
                        object: objects[trial_num],
                        item_name: item_name[trial_num],
                        n_examples: n_examples[0],
                        speaker: speakers[trial_num],
                        exemplar_num: exemplar_num
                    }
                )
            ]);

            exemplar_num += 1;
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
                        name: objects[trial_num][0],
                        property: objects[trial_num][2],
                        closed_image: objects[trial_num][1] + "_closed.svg",
                        open_image: objects[trial_num][1] + "_open.svg"
                    },
                    item_name: {
                        singular: item_name[trial_num][0],
                        plural: item_name[trial_num][1]
                    },
                    n_examples: n_examples[0],
                    speaker: speakers[trial_num],
                    background: back[trial_num],
                    spoken_text: []
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
                    object: objects[trial_num][0],
                    property: objects[trial_num][2],
                    item_name: item_name[trial_num][0],
                    n_examples: n_examples[0],
                    speaker: speakers[trial_num],
                    background: back[trial_num]
                }
            )
        ]);

        // Adds slider response slide
        exp.trials_stimuli = exp.trials_stimuli.concat([
            _.extend(
                {
                    trial_num: trial_num + 1,
                    type: "response",
                    object: objects[trial_num],
                    item_name: item_name[trial_num],
                    n_examples: n_examples[0]
                }
            )
        ]);

        trial_num += 1;
    }

    //make corresponding slides:
    exp.slides = make_slides(exp);

    exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                                        //relies on structure and slides being defined

    $('.slide').hide(); //hide everything

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
    // TO DO: add support for Canadian IP addresses
    function USOnly() {
        var accessKey = 'b487843addca6e9ec32e6ae28aeaa022';
         $.ajax({
             url: 'https://geo.ipify.org/api/v1?apiKey=at_nuIzsEIQJAft6sr1WH67UTfFDeMIO',
             dataType: 'jsonp',
             success: function(json) {
             if (json.location.country != 'US') {
                 var slides = document.getElementsByClassName('slide');
                 for (i=0; i<slides.length; i++) {
                    slides[i].style.display = 'none';
                 }
                    document.getElementsByClassName('progress')[0].style.display = 'none';
                    document.getElementById('unique').innerText = "This HIT is only available to workers in the United States. Please click 'Return' to avoid any impact on your approval rating.";
                }
            }
         });
    }

    exp.go(); //show first slide
    USOnly(); // check US IP address
}