// Experiment variables and randomization
var back =              shuffle([1,2,3,4,5,6,7,8,9,10]);
var agents =            shuffle(["Elephant","Pig","Frog","Mouse","Monkey","Bunny","Dog","Bear","Tiger","Cat","Sheep","Beaver"]);
var objects =           shuffle(["01", "02", "03", "04" , "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"]);
var item_name =         shuffle([ ["fep", "feps"], ["dax", "daxes"], ["blicket", "blickets"] ]);
var item_number =       shuffle([1, 2, 3]);
var item_presentation = shuffle(["pedagogical", "demonstration", "accidental"]);
var squeaky =           shuffle([true, false]);

function agent_straight(agent_class) {
    $(".agent").hide();
    $("."+agent_class+"_straight").show();
}

function agent_point_r(agent_class) {
    $(".agent").hide();
    $("."+agent_class+"_point_r").show();
}

function agent_say(display_text) {
    setTimeout (function() {
        $(".speech-bubble").show();
        $(".speech-bubble").text(display_text);
    }, 2000);
}

function object_fall(object_id, squeak) {
    // Object "falls" off table
    $(object_id).animate({
        left: "+=150px"},
        {
            duration: 500,
            easing: "easeInQuad"
    });
    $(object_id).animate({
        bottom: "0px"
        },
        {
            duration: 75,
            easing: "easeOutQuad"
        }
    );

        // Object falls and squeaks if squeak condition is true
    if (squeak) {
        setTimeout (function() {
            const squeak = new Audio("../_shared/audio/squeak.mp3");
            // squeak.muted = false;
            squeak.play();

            // audio.play();

            $(object_id).animate({
                height: "+=25px",
                // duration: 2000
            });

            $(object_id).animate({
                height: "-=25px",
                // duration: 2000
            });       
             // TO-DO: timing is off from animation sometimes??
        }, 575); // Time after object starts to move before it falls and squeaks   
    };
}

function change_image(class_name, source) {
    changing_images = document.getElementsByClassName(class_name);
    for (var i=0; i<changing_images.length; i+=1) {
        changing_images[i].src = source;
    }
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
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
                };
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

    slides.greeting = slide({
        name : "greeting",
        start : function() {
            $("button").hide();
            $(".agent").hide();
            agent_straight(agents[0]);
            change_image("background", "../_shared/images/back" + back[0] + ".jpg");    
        
            $(".speech-bubble").text("Hello! You must be the new scientist. Welcome to the laboratory!");
            // TO-DO: If audio is played, wait until audio finishes before revealing "next" button
            
            setTimeout( function() {
                $("button").show();
            }, 2000);
        },
        button : function() {
            exp.go(); //use exp.go() if and only if there is no "present" data.
        }
    });

    slides.trials = slide({
        name : "trials",
        present: exp.trials_data,
        present_handle : function(stim) {
            console.log(stim);
            this.stim = stim;

            if (stim.type == "trial") {
                $(".agent").hide();
                $("button").hide();
                $(".object").hide();
                $(".error").hide();
                $(".slider_label").hide();

                var temp_counter = 1;
                while (temp_counter <= stim.item_number) {
                    change_image("object", "../_shared/images/t" + stim.object + ".png");
                    $("#object" + temp_counter).show();
                    temp_counter += 1;
                };
                
                change_image("background", "../_shared/images/back" + stim.background + ".jpg");
                agent_straight(stim.agent);

                if (stim.item_number == 1) {
                    $(".speech-bubble").text("Let me show you what we've discovered! This is a " + stim.item_name[0] + "."); // singular
                } else {
                    $(".speech-bubble").text("Let me show you what we've discovered! These are " + stim.item_number + " " + stim.item_name[1] + "."); // plural
                };

                if (stim.item_presentation == "pedagogical") {
                    setTimeout( function() {
                        if (stim.squeak == true) {
                            $(".speech-bubble").text(stim.item_name[1].charAt(0).toUpperCase() + stim.item_name[1].slice(1, stim.item_name[1].length) + " squeak.");
                        } else {
                            $(".speech-bubble").text(stim.item_name[1].charAt(0).toUpperCase() + stim.item_name[1].slice(1, stim.item_name[1].length) + " don't squeak.");
                        };
                    }, 2000);
                };

                setTimeout( function() {
                    // if ((stim.item_presentation == "demonstration") || (stim.item_presentation == "pedagogical")) {
                        if (stim.item_number == 1) {
                            $(".speech-bubble").text("Let's see what sound this " + stim.item_name[0] + " makes."); // singular
                        } else {
                            $(".speech-bubble").text("Let's see what sounds these " + stim.item_name[1] + " make."); // plural
                        }
                    // };

                    setTimeout( function() {
                        $("button").hide();
                        $(".speech-bubble").hide();

                        // Agent points
                        agent_point_r(stim.agent);
                        $(".agent").animate(
                            { width: "+=20px"},
                            { duration: 200}
                        );
                        $(".agent").animate(
                            { width: "-=20px"},
                            { duration: 400}
                        );

                        // Object(s) fall(s) and squeak(s)
                        $(".agent").promise().done( function() {
                            object_fall("#object1", stim.squeaky);
                        
                            $("#object1").promise().done( function() {
                                if (stim.item_number >= 2) {  
                                    object_fall("#object2", stim.squeaky);
                                    $("#object2").promise().done( function() {
                                        if (stim.item_number == 3) {
                                            object_fall("#object3", stim.squeaky);
                                        };
                                    }); 
                                }
                            });
                        });

                        /*
                        if (item_number[0] >= 2) {
                           
                            $("#object1").promise().done(function() {fall_and_squeak("#object2"); });

                            if (item_number[0] == 3) {
                                $("#object2").promise().done(function() {
                                    fall_and_squeak("#object3");
                                    }
                                );
                            }
                        }
                        */

                        // Agent remarks on accidental object behavior
                        setTimeout (function() {
                            
                            agent_straight(stim.agent);
                            
                            if (stim.item_presentation == "accidental") {
                                if (stim.item_number == 1) {
                                    setTimeout( function() {
                                        $(".speech-bubble").show();
                                        $(".speech-bubble").text("Wow, did you notice what the " + stim.item_name[0] + " just did?");
                                    }, 2000);
                                } else {
                                    setTimeout( function() {
                                        $(".speech-bubble").show();
                                        $(".speech-bubble").text("Wow, did you notice what the " + stim.item_number + " "+ stim.item_name[1] + " just did?");
                                    }, 2000);
                                };
                                setTimeout (function () {
                                    $("#continue_button1").show();
                                }, 2000); // Time before continue button shows
                            } else {
                                $("#continue_button1").show();
                            }
                        }, (600 + (600 * stim.item_number))); // Time after "squeak" before agent speaks
                    }, 2000); // Time after agent first (second?) speaks before poking object
                }, 2000);
            } else {
                $(".agent").hide();
                $("button").hide();
                $(".object").hide();
                $(".error").hide();
                $(".table").hide();
                $(".speech-bubble").hide();
                $(".background").hide();
                $(".slider_label").show();

                $("#prompt").text("Imagine that you have another " + stim.item_name[0] + ". What do you think would be the likelihood that it squeaks?");
                this.init_sliders();
                exp.sliderPost = null;

                $("#continue_button2").show();
            }
        },

        init_sliders: function() {
            utils.make_slider("#single_slider", function(event, ui) {
                exp.sliderPost = ui.value;
            });
        },

        continue_button1 : function() {
            _stream.apply(this);
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
                    "trials" : exp.trials_data,
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

    exp.trials = [];
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

    //blocks of the experiment:
    exp.structure=[
        // "i0",
        // "botcaptcha",
        // "sound_check",
        // "introduction",
        "greeting",
        "trials",
        "subj_info",
        "thanks"
    ];

    exp.trials_data = [{
        type: "trial",
        background: back[0],
        agent: agents[0],
        object: objects[0],
        item_name: item_name[0],
        item_number: item_number[0],
        item_presentation: item_presentation[0],
        squeaky: squeaky[0]
    }, {
        type: "response",
        background: back[0],
        agent: agents[0],
        object: objects[0],
        item_name: item_name[0],
        item_number: item_number[0],
        item_presentation: item_presentation[0],
        squeaky: squeaky[0]
    }];

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