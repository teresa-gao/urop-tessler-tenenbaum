// Experiment variables and randomization
var testAgents = shuffle(["Elephant","Pig","Frog","Mouse","Monkey","Bunny","Dog","Bear","Tiger","Cat","Sheep","Beaver"]);

function showAgent(id, orient) {
    $(".agent").hide();
    $(".point_agent_l").hide();
    $(".point_agent_r").hide();
    $("#"+id+"_"+orient).show();
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

// MAIN PART OF PROGRAM BEGINS HERE! :)
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
            $("#error").hide();
            $("#error_incorrect").hide();
            $("#error_2more").hide();
            $("#error_1more").hide();
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
            document.getElementById('bot_context').appendChild(document.createElement("br"));
            document.getElementById('bot_context').appendChild(bot_question);
            document.getElementById('bot_context').appendChild(document.createElement("br"));

         },
         button: function() {
            // get the participants' input
            bot_response = $("#botresponse").val();
            // append data if response correct
            if (bot_response.toLowerCase() == listener.toLowerCase()) {
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
                $("#error_incorrect").show();
                if (this.bot_trials == 1) {
                        $("#error_2more").show();
                } else if (this.bot_trials == 2) {
                        $("#error_2more").hide();
                        $("#error_1more").show();
                } else {
                    // if participant fails, they cannot proceed
                        $("#error_incorrect").hide();
                        $("#error_1more").hide();
                        $("#bot_button").hide();
                        $('#botresponse').prop("disabled", true);
                        $("#error").show();
                };
            }
        }
    });

    slides.sound_check = slide({
        name: "sound_check",
        start: function() {
            exp.sound_word = _.sample(['tiger', 'evergreen']);
            exp.sound = new Audio('../_shared/audio/'+exp.sound_word+'.mp3');
            $('.err').hide();
        },
        test_sound: function() {
            exp.sound.play();
        },
        button: function() {
            if ($('#sound_response').val() == '') {
            $('.err').show();
            }
            else {
            response = $('#sound_response').val();
            exp.sound_check = response;
            exp.go();
            }
        }
    });

    slides.introduction = slide({
        name : "introduction",
        button : function() {
            exp.go(); //use exp.go() if and only if there is no "present" data.
        }
    });

    slides.subj_info = slide({
        name : "subj_info",
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

    slides.trials = slide({
        name : "trials",
        start : function() {
            var back = shuffle([1,2,3,4,5,6,7,8,9,10]);
            background("../_shared/images/back" + back[0] + ".jpg");
        },
        button : function() {
            exp.go();
        }
    });

    slides.thanks = slide({
        name : "thanks",
        start : function() {
            exp.data= {
                    "trials" : exp.trials_data,
                    "catch_trials" : exp.catch_trials,
                    "system" : exp.system,
                    "condition" : exp.condition,
                    "subject_information" : exp.subj_data,
                    "time_in_minutes" : (Date.now() - exp.startT)/60000
            };
            setTimeout(function() {turk.submit(exp.data);}, 1000);

            // TO-DO: PICK UP AT LINE 451 OF kids_combination.js for agents
        }
    });

    return slides;
}

function background(x) {
    document.getElementById("background").src = x;
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
        "i0",
        "botcaptcha",
        "sound_check",
        "introduction",
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