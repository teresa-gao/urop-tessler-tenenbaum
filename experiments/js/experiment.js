// Experiment variables and randomization
var total_trials_num =  3;

var back =              shuffle([1,2,3,4,5,6,7,8,9,10]);
var agents =            shuffle(["Elephant","Pig","Monkey","Dog","Bear","Tiger","Cat","Sheep"]); // Bunny, Beaver, Frog, and Mouse excluded due to difference from mean width
var speakers =          shuffle(["mh", "tg", "sb"]);

var artifacts =         shuffle([ ["artifact", "artifact01", "squeaking"], ]);
var flowers =           shuffle([ ["flower", "flower01", "purple petals"] ]);
var birds =             shuffle([ ["bird", "bird02", "green feathers"] ]);
var objects =           shuffle([ artifacts[0], flowers[0], birds[0]]);

var item_name =         shuffle([ ["fep", "feps"], ["dax", "daxes"], ["blicket", "blickets"] ]);
var item_number =       shuffle([1, 2, 3, 4]);
var item_presentation = shuffle(["accidental", "pedagogical"]);

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

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

function agent_say(display_text, duration=2000) {
    let deferred = new $.Deferred();

    $(".speech").show();
    $(".speech-bubble").text(display_text);

    setTimeout (function() {
        deferred.resolve();
    }, duration);

    return deferred.promise();
}

function set_table(stim) {
    // Displays objects, blankets, and tags
    let temp_counter = 1;
    while (temp_counter <= stim.item_number) {
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
            if (stim.item_presentation == "accidental") {
                say_text += "Oh wow! ";
                audio_file_name += "oh_wow_";
            } else if (stim.item_presentation == "pedagogical") {
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

            agent_say(say_text, delay_time);

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
        if (stim.item_presentation == "pedagogical") {
            greeting += "Hello! I've been here for a while.";
            hello = new Audio("audio/" + stim.speaker + "_recordings/hello_ive_been_here.mp3");
            hello.play();
        } else if (stim.item_presentation == "accidental") {
            greeting += "Hello! I just arrived here.";
            hello = new Audio("audio/" + stim.speaker + "_recordings/hello_i_just_arrived.mp3");
            hello.play();
        }

        agent_say(greeting, 2250).then(
            function() {
                $(".continue_button1").show();
            }
        );

    // Agent remarks on objects (number and name) on table
    } else if (stim.type == "lookit") {
        
        set_table(stim);

        let lookit = "";
        let wait_time = 3000;

        if (stim.item_number > 1) {
            lookit = "There are " + stim.item_number + " " + stim.item_name[1] + " on the table.";
            there_on_table = new Audio("audio/" + stim.speaker + "_recordings/" + stim.item_number + "_" + stim.item_name[1] + ".mp3");
        } else {
            lookit = "There is " + stim.item_number + " " + stim.item_name[0] + " on the table.";
            there_on_table = new Audio("audio/" + stim.speaker + "_recordings/" + stim.item_number + "_" + stim.item_name[0] + ".mp3");
        }

        if (stim.item_presentation == "accidental") {
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

        agent_say(lookit, wait_time);

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

        if (stim.item_presentation == "accidental") { // Accidental item presentation

            poke_blanket_fall(stim).then(
                function() {
                    let deferred = new $.Deferred();

                    agent_say("Oops!");
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

        } else if (stim.item_presentation == "pedagogical") { // Pedagogical item presentation

            show_you = new Audio("audio/" + stim.speaker + "_recordings/let_me_show_you_something.mp3");
            show_you.play();

            agent_say("Let me show you something.", 2000).then(
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
                    
                    agent_say("Watch this!");

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

            exp.botcaptcha_startT = Date.now();

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
                    condition: "botcaptcha",
                    bot_prompt: this.bot_question,
                    bot_num_fails: this.bot_trials,
                    bot_responses: this.all_responses,
                    bot_time_in_seconds: (Date.now() - exp.botcaptcha_startT) / 1000
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
                            $(".error").hide();
                            $("#sound_button").hide();
                            $("#sound_test_button").hide();
                            $(".progress").hide();
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
            exp.sound_startT = Date.now();
            exp.sound_word = _.sample(["tiger", "shadow"]);
            exp.sound = new Audio("audio/"+exp.sound_word+".mp3");
            $('.error').hide();
        },
        test_sound: function() {
            exp.sound.play();
        },
        button: function() {
            // get the participants' input
            sound_response = $("#sound_response").val();
            
            if (sound_response.toLowerCase() == "") {
                $(".error_incorrect").hide();
                $(".write_something").show();
            } else {
                this.all_responses.push(sound_response);
                if (sound_response.toLowerCase() == exp.sound_word) {

                // Log data to MTurk
                exp.catch_trials.push({
                    condition: "sound_response",
                    sound_prompt: exp.sound_word,
                    sound_num_fails: this.sound_trials,
                    sound_responses: this.all_responses,
                    sound_time_in_seconds: (Date.now() - exp.sound_startT) / 1000
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
            exp.intro_startT = Date.now();
        },
        button : function() {
            exp.intro_endT = Date.now();

            _.extend(exp.trials_data_streamlined[0],
                {
                    trial_num: 0, // Introduction
                    intro_time_in_seconds: (exp.intro_endT - exp.intro_startT) / 1000
                }
            );

            exp.go();
        }
    });

    slides.trials = slide({
        name : "trials",
        present: exp.trials_data,
        start: function() {
            exp.trials_startT = Date.now();
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
            exp.trials_slidersT = Date.now();
            utils.make_slider("#single_slider", function(event, ui) {
                exp.sliderPost = ui.value;
            });
        },

        continue_button2 : function() {
            if (exp.sliderPost == null) {
                $(".error").show();
            } else {
                exp.trials_endT = Date.now();

                _.extend(exp.trials_data_streamlined[this.stim.trial_num], 
                    {
                        trial_time_in_seconds: (exp.trials_slidersT - exp.trials_startT) / 1000,
                        slider_response: exp.sliderPost,
                        slider_time_in_seconds: (exp.trials_endT - exp.trials_slidersT) / 1000
                    }
                );

                _stream.apply(this);
                exp.trials_startT = Date.now();
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

            exp.data = {
                condition: exp.condition,
                trials_data: exp.trials_data_streamlined,
                system: exp.system,
                catch_trials: exp.catch_trials,
                subject_information: exp.subj_data,
                total_time: {
                    time_in_seconds: (Date.now() - exp.startT) / 1000
                }
                    
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

    /* commented out for Sandbox testing purposes
    repeatWorker = false;
    (function(){
            var ut_id = "tg-2020-04-20-genex";
            if (UTWorkerLimitReached(ut_id)) {
                $('.slide').empty();
                repeatWorker = true;
                alert("You have already completed the maximum number of HITs allowed by this requester. Please click 'Return HIT' to avoid any impact on your approval rating.");
            }
    })();
    */

    exp.catch_trials = [];
    exp.condition = {
        item_presentation: item_presentation[0],
        item_number: item_number[0]
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

    // Data used to run present_handle
    exp.trials_data = [];

    // Data to submit to MTurk — streamlined and flattened
    exp.trials_data_streamlined = [{}];

    let big_temp_counter = 0;
    while (big_temp_counter < total_trials_num) {

        exp.trials_data = exp.trials_data.concat([ 
            _.extend(
                {
                    trial_num: big_temp_counter + 1,
                    type: "greeting",
                    item_presentation: item_presentation[0],
                    background: back[big_temp_counter],
                    agent: agents[big_temp_counter],
                    speaker: speakers[big_temp_counter]
                }
            ),
            _.extend(
                {
                    trial_num: big_temp_counter + 1,
                    type: "lookit",
                    item_presentation: item_presentation[0],
                    agent: agents[big_temp_counter],
                    object: objects[big_temp_counter],
                    item_name: item_name[big_temp_counter],
                    item_number: item_number[0],
                    speaker: speakers[big_temp_counter]
                }
            )
        ]);

        let temp_counter = 1;
        while (temp_counter < item_number[0] + 1) {

            exp.trials_data = exp.trials_data.concat([ 
                _.extend(
                    {
                        trial_num: big_temp_counter + 1,
                        type: "trial",
                        item_presentation: item_presentation[0],
                        agent: agents[big_temp_counter],
                        object: objects[big_temp_counter],
                        item_name: item_name[big_temp_counter],
                        item_number: item_number[0],
                        speaker: speakers[big_temp_counter],
                        exemplar_num: temp_counter
                    }
                )
            ]);

            temp_counter += 1;
        }

        exp.trials_data_streamlined = exp.trials_data_streamlined.concat([
            _.extend(
                {
                    trial_num: big_temp_counter + 1,
                    item_presentation: item_presentation[0],
                    agent: agents[big_temp_counter],
                    object: objects[big_temp_counter][0],
                    item_name: item_name[big_temp_counter][0],
                    item_number: item_number[0],
                    speaker: speakers[big_temp_counter],
                    background: back[big_temp_counter]
                }
            )
        ]);

        exp.trials_data = exp.trials_data.concat([
            _.extend(
                {
                    trial_num: big_temp_counter + 1,
                    type: "response",
                    object: objects[big_temp_counter],
                    item_name: item_name[big_temp_counter],
                    item_number: item_number[0]
                }
            )
        ]);

        big_temp_counter += 1;
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