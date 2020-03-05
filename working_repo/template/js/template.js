// Experiment variables and randomization
var back = shuffle([1,2,3,4,5,6,7,8,9,10]);
var agents = shuffle(["Elephant","Pig","Frog","Mouse","Monkey","Bunny","Dog","Bear","Tiger","Cat","Sheep","Beaver"]);
var object = shuffle(["01", "02", "03", "04" , "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"]);
var item_name = shuffle([ ["fep", "feps"], ["dax", "daxes"], ["blicket", "blickets"] ]);
var item_number = shuffle([1, 2, 3]);

function agent_straight(agent_id) {
    $(".agent").hide();
    $("#"+agent_id+"_straight").show();
}

function agent_point_r(agent_id) {
    $(".agent").hide();
    $("#"+agent_id+"_point_r").show();
}

function fall_and_squeak(object_id) {
    // Object "falls" off table
    $(object_id).animate({
        left: "+=150px"},
        {
            duration: 500,
            easing: "easeInQuad"
    });
    $(object_id).animate({
        bottom: "-=25px"
        },
        {
            duration: 75,
            easing: "easeOutQuad"
        }
    );

        // Object "falls" and squeaks
    setTimeout (function() {
        const squeak = new Audio('../_shared/audio/squeak.mp3');

        $(object_id).animate({
            height: "+=25px",
            duration: 2000,
        });
        $(object_id).animate({
            height: "-=25px",
            duration: 2000
        });
        squeak.play(); // TO-DO: timing is off from animation sometimes??
    }, 575); // Time after object starts to move before it falls and squeaks   
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
                exp.catch_trials.push({
                    condition: "botcaptcha",
                    n_fails: this.bot_trials,
                    response: bot_response,
                    bot_sentence: this.bot_utterance,
                    bot_question: this.bot_question
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

    slides.trials = slide({
        name : "trials",
        /* present: exp.trials_data, */

        start : function() {
            $(".agent").hide();
            $("button").hide();
            $(".object").hide();

            var temp_counter = 1;
            while (temp_counter <= item_number[0]) {
                console.log("object" + temp_counter);
                change_image("object" + temp_counter, "../_shared/images/t" + object[0] + ".png");
                $("#object" + temp_counter).show();
                temp_counter += 1;
            };
            
            change_image("background", "../_shared/images/back" + back[0] + ".jpg");
            
            agent_straight(agents[0]);
            $(".speech-bubble").text("Hello! You must be the new scientist. Welcome to the laboratory!");
            // TO-DO: If audio is played, wait until audio finishes before revealing "next" button
            setTimeout( function() {
                $("#next_button").delay(2000).show();
            }, 2000);
        },

        next_button : function() {
            $("button").hide();
            $("#next_button").hide();

            if (item_number[0] == 1) {
                $(".speech-bubble").text("Let me show you what we've discovered! This is a " + item_name[0][0] + "."); // singular
            } else {
                $(".speech-bubble").text("Let me show you what we've discovered! These are " + item_number[0] + " " + item_name[0][1] + "."); // plural
            };
            
            setTimeout( function() {
                $("button").hide();
                $(".speech-bubble").hide();

                // Agent points
                agent_point_r(agents[0]);
                $(".agent").animate(
                    { width: "+=20px"},
                    { duration: 200}
                );
                $(".agent").animate(
                    { width: "-=20px"},
                    { duration: 400}
                );

                // Object(s) fall(s) and squeak(s)
                temp_counter = 1;
                while (temp_counter <= item_number[0]) {
                    setTimeout(function() {
                        setTimeout(fall_and_squeak("#object" + temp_counter), 2500);
                        temp_counter += 1;
                    }, 2000);   
                }

                // Agent remarks on accidental object behavior
                setTimeout (function() {
                    $(".speech-bubble").show();
                    agent_straight(agents[0]);
                    
                    if (item_number[0] == 1) {
                        $(".speech-bubble").text("Wow, did you notice what the " + item_name[0][0] + " just did?");
                    } else {
                        $(".speech-bubble").text("Wow, did you notice what the " + item_name[0][1] + " just did?");
                    };

                    setTimeout (function () {
                        $("#continue_button1").show();

                    }, 2000); // Time after agent speaks before continue button shows
                }, 2250); // Time after "squeak" before agent speaks
            }, 2000); // Time after agent first (second?) speaks before poking object
        },
        
        continue_button1 : function() {
            $("#background").hide();
            $(".speech-bubble").hide();
            $(".agent").hide();
            $(".object").hide();
            $("#table").hide();
            $("button").hide();
            // display slider here
            $("#continue_button2").show();
        },

        continue_button2 : function() {
            exp.go();
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
                asses : $('input[name="assess"]:checked').val(),
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

function change_image(id_name, source) {
    document.getElementById(id_name).src = source;
}

/// init ///
function init() {

    //; support for uniqueturker
    // https://uniqueturker.myleott.com
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
        "trials",
        "subj_info",
        "thanks"
    ];

    exp.trials_data = [];

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