// Experiment variables and randomization
var back =              shuffle([1,2,3,4,5,6,7,8,9,10]);
var agents =            shuffle(["Elephant","Pig","Monkey","Dog","Bear","Tiger","Cat","Sheep"]); // Bunny, Beaver, Frog, and Mouse excluded due to difference from mean width

var artifacts =         shuffle([ ["artifact", "artifact01", "squeaking"], ]);
var flowers =           shuffle([ ["flower", "flower01", "purple flowers"], ["flower", "flower02", "yellow flowers"] ]);
var birds =             shuffle([ ["bird", "bird01", "purple wings"], ["bird", "bird02", "green wings"] ]);
var objects =           ([ artifacts[0], flowers[0], birds[0]]);

var item_name =         shuffle([ ["fep", "feps"], ["dax", "daxes"], ["blicket", "blickets"] ]);
var item_number =       shuffle([1, 2, 3, 4]);
var item_presentation = shuffle(["accidental", "pedagogical", "gen+ped", "generic"]); // For now, this remains unshuffled

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

function animation(stim) {
    
    // console.log("passed to function:");
    // console.log(stim);

    // Agent prods line of object(s)
    agent_poke_r(stim.agent).then(
            
        // Blanket drops
        function() {
            let deferred = new $.Deferred();

            let temp_counter = stim.exemplar_num;

            $(".label" + temp_counter).fadeOut(600);
            $(".blanket" + temp_counter + ".blanket_up").fadeOut(600);
            $(".blanket" + temp_counter + ".blanket_down").fadeIn(600);
        
            setTimeout (function() {
                deferred.resolve();
            }, 600);

            return deferred.promise();
        }
    ).then(

        
        function() {
            let deferred = new $.Deferred();
            
            if (stim.object[0] == "artifact") {
                squeak = new Audio('../_shared/audio/squeak.mp3');
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
                gliss_up = new Audio('../_shared/audio/gliss_up.mp3');
                gliss_up.play();
                $(".object" + stim.exemplar_num + ".closed").fadeOut(600);
                $(".object" + stim.exemplar_num + ".open").fadeIn(600);

            }

            setTimeout (function() {
                deferred.resolve();
            }, 600);

            return deferred.promise();
        }
    ).then(

        // Agent remarks on "open" object property
        function() {
            let deferred = new $.Deferred();

            agent_straight(stim.agent);
            
            let say_text = "";
            if (stim.item_presentation == "accidental") {
                say_text = "Wow, " + stim.object[2] + "!"
            } else {
                if (stim.object[0] == "artifact") {
                    say_text = "Did you hear that? Squeaking!";
                } else {
                    say_text = "Did you see that? " + stim.object[2].charAt(0).toUpperCase() + stim.object[2].slice(1) + "!";
                }
            }

            agent_say(say_text);

            setTimeout (function() {
                deferred.resolve();
            }, 2000);

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

function run_trial(stim) {

    $("button").hide();
    $(".object, .error, .speech, .slider, .blanket, .label").hide();

    $(".table, .background").show();

    // Agent greets user
    if (stim.type == "greeting") {
        agent_straight(stim.agent);
        change_image("background", "../_shared/images/back" + stim.background + ".jpg");    
        
        $(".speech-bubble-tail, .speech-bubble-outline").css("right", "475px");
        agent_say("Hello, and welcome to the laboratory!").then(
            function() {
                $(".continue_button1").show();
            }
        );

    // Trial
    } else if (stim.type == "trial") {
        
        // Displays objects, blankets, and tags
        let temp_counter = 1;
        while (temp_counter <= stim.item_number) {
            change_image("closed", "../_shared/images/" + stim.object[1] + "_closed.svg");
            // console.log("../_shared/images/" + stim.object[1] + "_closed.svg");
            change_image("open", "../_shared/images/" + stim.object[1] + "_open.svg");

            $(".object" + temp_counter + ".closed").show();
            // console.log(".object" + temp_counter + ".closed");
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
        // console.log("adjust all");

        if (stim.object[0] == "bird") {
            // console.log("object adjusted as bird");
            $(".object1.open").css("right", "219px");
            $(".object2.open").css("right", "146px");
            $(".object3.open").css("right", "73px");
            $(".object4.open").css("right", "0px");
        } else if (stim.object[0] == "flower") {
            // console.log("object adjusted as flower");
            $(".open").css("height", "95.5px");
        }

        // Agent says "look at that"
        if (stim.item_presentation == "lookit") {

            let say_text = "";
            if (stim.item_number == 1) {
                say_text = "Look at that! There is " + stim.item_number + " " + stim.item_name[0] + " on the table.";
            } else {
                say_text = "Look at that! There are " + stim.item_number + " " + stim.item_name[1] + " on the table.";
            };

            agent_say(say_text, 3000).then(
                function() {
                    $(".continue_button1").show();
                }
            );

        // Trial trial
        } else {

            let agent_right_val = (360 - (stim.exemplar_num - 1)*73) + "px";
            let speech_tail_val = (475 - (stim.exemplar_num - 1)*73) + "px";

            // Previously shown objects are still displayed
            let temp_counter = 1;
            while (temp_counter < stim.exemplar_num) {
                change_image("closed", "../_shared/images/" + stim.object[1] + "_closed.svg");
                $(".blanket" + temp_counter + ".blanket_up").hide();
                $(".blanket" + temp_counter + ".blanket_down").show();
                $(".label" + temp_counter).hide();
                temp_counter += 1;
            };

            // Agent and speech bubble position adjust to active object
            $("." + stim.agent + "_straight").css("right", agent_right_val);
            $("." + stim.agent + "_point_r").css("right", agent_right_val);
            $(".speech-bubble-outline").css("right", speech_tail_val);
            $(".speech-bubble-tail").css("right", speech_tail_val);

           
            if (stim.item_presentation == "generic") {
                
                let say_text = "I have something to tell you: " + stim.item_name[1];

                if (stim.object[0] == "artifact") {
                    say_text += " squeak";
                } else {
                    say_text += " have " + stim.object[2];
                }

                agent_say(say_text + ".", 3000).then(
                    // Continues to next
                    function() {
                        $(".continue_button1").show();
                    }
                );

            } else if (stim.item_presentation == "accidental") {
                animation(stim);
            } else {
                $(".speech-bubble").show();
                
                let say_text = "I have something to show you";

                if (stim.item_presentation == "gen+ped") {
                    say_text += ": " + stim.item_name[1];

                    if (stim.object[0] == "artifact") {
                        say_text += " squeak.";
                    } else {
                        say_text += " have " + stim.object[2] + ".";
                    }
                } else {
                    say_text += ". Watch this!"
                }

                agent_say(say_text, 3000).then(
                    function() {
                        animation(stim);
                    }
                );
            }
        }
    }
}

// MAIN PROGRAM BEGINS HERE! :)
function make_slides(f) {
    var slides = {};

    slides.i0 = slide({
        name : "i0",
        start: function() {
            exp.startT = Date.now();
        }
    });

    // simple language comprehension check to include at beginning of experiment
    slides.botcaptcha = slide({
        name : "botcaptcha",
        bot_trials : 0,
        start: function() {
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
            // append data if response correct
            if (bot_response.toLowerCase() == "") {
                $(".error_incorrect").hide();
                $(".write_something").show();
            } else if (bot_response.toLowerCase() == listener.toLowerCase()) {
                /*
                exp.catch_trials.push({
                    condition: "botcaptcha",
                    n_fails: this.bot_trials,
                    response: bot_response,
                    bot_sentence: this.bot_utterance,
                    bot_question: this.bot_question
                });
                */
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
    });

    slides.sound_check = slide({
        name: "sound_check",
        sound_trials: 0,
        start: function() {
            exp.sound_word = _.sample(['tiger', 'evergreen']);
            exp.sound = new Audio('../_shared/audio/'+exp.sound_word+'.mp3');
            $('.error').hide();
        },
        test_sound: function() {
            exp.sound.play();
        },
        button: function() {
            // get the participants' input
            sound_response = $("#sound_response").val();
            // append data if response correct
            
            if (sound_response.toLowerCase() == "") {
                $(".error_incorrect").hide();
                $(".write_something").show();
            } else if (sound_response.toLowerCase() == exp.sound_word) {
                /* TO-DO: fix this MTurk data-pushing
                exp.catch_trials.push({
                    condition: "sound_response",
                    n_fails: this.bot_trials,
                    response: bot_response,
                    bot_sentence: this.bot_utterance,
                    bot_question: this.bot_question
                });
                */
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
    });

    slides.introduction = slide({
        name : "introduction",
        button : function() {
            exp.go(); //use exp.go() if and only if there is no "present" data.
        }
    });

    slides.trials1 = slide({
        name : "trials1",
        present: exp.trials1_data,
        present_handle : function(stim) {
            this.stim = stim;

            // console.log(this.stim);
            run_trial(this.stim);

            // Capture user response (prediction)
            if ((this.stim.type != "greeting") && (this.stim.type != "trial")) {
                $(".agent").hide();
                $(".object").hide();
                $(".error").hide();
                $(".speech").hide();
                $(".blanket").hide();
                $(".label").hide();
                $(".table").hide();
                $(".background").hide();

                $(".slider").show();

                if (this.stim.object[0] == "artifact") {
                    $(".prompt").text("Imagine that you have another " + this.stim.item_name[0] + ". What do you think would be the likelihood that it squeaks?");
                } else {
                    $(".prompt").text("Imagine that you have another " + this.stim.item_name[0] + ". What do you think would be the likelihood that it has " + stim.object[2] + "?");
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
            utils.make_slider("#single_slider1", function(event, ui) {
                exp.sliderPost = ui.value;
            });
        },

        continue_button2 : function() {
            if (exp.sliderPost == null) {
                $(".error").show();
            } else {
                _stream.apply(this);      
            }
        }
    });
    
    slides.trials2 = slide({
        name : "trials2",
        present: exp.trials2_data,
        present_handle : function(stim) {
            this.stim = stim;

            // console.log(this.stim);
            run_trial(this.stim);

            // Capture user response (prediction)
            if ((this.stim.type != "greeting") && (this.stim.type != "trial")) {
                $(".agent").hide();
                $(".object").hide();
                $(".error").hide();
                $(".speech").hide();
                $(".blanket").hide();
                $(".label").hide();
                $(".table").hide();
                $(".background").hide();

                $(".slider").show();

                if (this.stim.object[0] == "artifact") {
                    $(".prompt").text("Imagine that you have another " + this.stim.item_name[0] + ". What do you think would be the likelihood that it squeaks?");
                } else {
                    $(".prompt").text("Imagine that you have another " + this.stim.item_name[0] + ". What do you think would be the likelihood that it has " + stim.object[2] + "?");
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
            utils.make_slider("#single_slider2", function(event, ui) {
                exp.sliderPost = ui.value;
            });
        },

        continue_button2 : function() {
            if (exp.sliderPost == null) {
                $(".error").show();
            } else {
                _stream.apply(this);      
            }
        }
    });

    slides.trials3 = slide({
        name : "trials3",
        present: exp.trials3_data,
        present_handle : function(stim) {
            this.stim = stim;

            // console.log(this.stim);
            run_trial(this.stim);

            // Capture user response (prediction)
            if ((this.stim.type != "greeting") && (this.stim.type != "trial")) {
                $(".agent").hide();
                $(".object").hide();
                $(".error").hide();
                $(".speech").hide();
                $(".blanket").hide();
                $(".label").hide();
                $(".table").hide();
                $(".background").hide();

                $(".slider").show();

                if (this.stim.object[0] == "artifact") {
                    $(".prompt").text("Imagine that you have another " + this.stim.item_name[0] + ". What do you think would be the likelihood that it squeaks?");
                } else {
                    $(".prompt").text("Imagine that you have another " + this.stim.item_name[0] + ". What do you think would be the likelihood that it has " + stim.object[2] + "?");
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
            utils.make_slider("#single_slider3", function(event, ui) {
                exp.sliderPost = ui.value;
            });
        },

        continue_button2 : function() {
            if (exp.sliderPost == null) {
                $(".error").show();
            } else {
                _stream.apply(this);      
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
            exp.data= {
                    "trials1" : exp.trials1_data,
                    "trials2" : exp.trials2_data,
                    "trials3" : exp.trials3_data,
                    "catch_trials" : exp.catch_trials,
                    "system" : exp.system,
                    "condition" : exp.condition,
                    "subject_information" : exp.subj_data,
                    "time_in_minutes" : (Date.now() - exp.startT)/60000
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
    xhr.open("GET", "http://localhost:8000", true); // ../_shared/audio/squeak.mp3
    xhr.responseType = "blob";
    var audio = document.querySelector("audio");
    xhr.onload = function() {
        audio.src = URL.createObjectURL(xhr.response);
    };
    xhr.send();
    */

    repeatWorker = false;
    (function(){
            var ut_id = "[INSERT uniqueTurkerID]";
            if (UTWorkerLimitReached(ut_id)) {
                $('.slide').empty();
                repeatWorker = true;
                alert("You have already completed the maximum number of HITs allowed by this requester. Please click 'Return HIT' to avoid any impact on your approval rating.");
            }
    })();

    exp.trials1 = [];
    exp.catch_trials = [];
    exp.condition = _.sample(["CONDITION 1", "condition 2"]); //can randomize between subject conditions here
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
        // "i0",
        // "botcaptcha",
        // "sound_check",
        // "introduction",
        "trials1",
        "trials2",
        "trials3",
        "subj_info",
        "thanks"
    ];

    // First trial
    exp.trials1_data = [
        {
            type: "greeting",
            background: back[0],
            agent: agents[0]
        }, {
            type: "trial",
            item_presentation: "lookit",
            agent: agents[0],
            object: objects[0],
            item_name: item_name[0],
            item_number: item_number[0],
        }
    ];

    let temp_counter = 2;
    exp.trials1_data = exp.trials1_data.concat([ 
        _.extend(
            {
                type: "trial",
                item_presentation: item_presentation[0],
                agent: agents[0],
                object: objects[0],
                item_name: item_name[0],
                item_number: item_number[0],
                exemplar_num: 1
            }
        )
    ]);

    while ((temp_counter < item_number[0] + 1) && (item_presentation[0] != "generic")) {
        exp.trials1_data = exp.trials1_data.concat([ 
            _.extend(
                {
                    type: "trial",
                    item_presentation: item_presentation[0],
                    agent: agents[0],
                    object: objects[0],
                    item_name: item_name[0],
                    item_number: item_number[0],
                    exemplar_num: temp_counter
                }
            )
        ]);

        temp_counter += 1;
    }

    exp.trials1_data = exp.trials1_data.concat([
        _.extend(
            {
                type: "response",
                background: back[0],
                agent: agents[0],
                object: objects[0],
                item_name: item_name[0],
                item_number: item_number[0],
                item_presentation: item_presentation[0],
            }
        )
    ]);

    // Second trial
    exp.trials2_data = [
        {
            type: "greeting",
            background: back[1],
            agent: agents[1]
        }, {
            type: "trial",
            item_presentation: "lookit",
            agent: agents[1],
            object: objects[1],
            item_name: item_name[1],
            item_number: item_number[0],
        }
    ];

    temp_counter = 2;
    exp.trials2_data = exp.trials2_data.concat([ 
        _.extend(
            {
                type: "trial",
                item_presentation: item_presentation[0],
                agent: agents[1],
                object: objects[1],
                item_name: item_name[1],
                item_number: item_number[0],
                exemplar_num: 1
            }
        )
    ]);

    while ((temp_counter < item_number[0] + 1) && (item_presentation[0] != "generic")) {
        exp.trials2_data = exp.trials2_data.concat([ 
            _.extend(
                {
                    type: "trial",
                    item_presentation: item_presentation[0],
                    agent: agents[1],
                    object: objects[1],
                    item_name: item_name[1],
                    item_number: item_number[0],
                    exemplar_num: temp_counter
                }
            )
        ]);

        temp_counter += 1;
    }

    exp.trials2_data = exp.trials2_data.concat([
        _.extend(
            {
                type: "response",
                background: back[1],
                agent: agents[1],
                object: objects[1],
                item_name: item_name[1],
                item_number: item_number[0],
                item_presentation: item_presentation[0],
            }
        )
    ]);

    // Third trial
    exp.trials3_data = [
        {
            type: "greeting",
            background: back[2],
            agent: agents[2]
        }, {
            type: "trial",
            item_presentation: "lookit",
            agent: agents[2],
            object: objects[2],
            item_name: item_name[2],
            item_number: item_number[0],
        }
    ];

    temp_counter = 2;
    exp.trials3_data = exp.trials3_data.concat([ 
        _.extend(
            {
                type: "trial",
                item_presentation: item_presentation[0],
                agent: agents[2],
                object: objects[2],
                item_name: item_name[2],
                item_number: item_number[0],
                exemplar_num: 1
            }
        )
    ]);

    while ((temp_counter < item_number[0] + 1) && (item_presentation[0] != "generic")) {
        exp.trials3_data = exp.trials3_data.concat([ 
            _.extend(
                {
                    type: "trial",
                    item_presentation: item_presentation[0],
                    agent: agents[2],
                    object: objects[2],
                    item_name: item_name[2],
                    item_number: item_number[0],
                    exemplar_num: temp_counter
                }
            )
        ]);

        temp_counter += 1;
    }

    exp.trials3_data = exp.trials3_data.concat([
        _.extend(
            {
                type: "response",
                background: back[2],
                agent: agents[2],
                object: objects[2],
                item_name: item_name[2],
                item_number: item_number[0],
                item_presentation: item_presentation[0],
            }
        )
    ]);

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