*last updated 31 May 2020*

# Overview

## To run the experiment...

...open **experiment.html**

## To edit the experiment...

...open **experiment.js**

### TL;DR overview of experiment.js file

* Variable declarations *(up to line 27)* — Much of the experiment can be modified solely by changing these variable values
* Functions *(lines 29 through 540)* — These are used primarily in `slides.trials` (trials slide)
* Slides *(lines 542 through 1074)* — These include intro slide, catch trials, (experimental) trial slides, attention checks, manipulation checks, info, and thank-you (data submission to MTurk)
* Setup *(from line 1076 on)* — Here, we create the data frames which are passed as stim into slides.trials, slides.attention_check, and slides.manipulation_check and/or used to collect data to be submitted to MTurk; declare exp.structure; and set up things such as Unique Turker

Most of the experiment components (number of subtrials, conditions, agents, speakers, etc.) can be modified straightforwardly via variables at the top of the file.

### Number of subtrials

* Edit total_trials_num *(line 2)*
* If more than 3 subtrials are desired...
	* (An) additional object(s) option must be included in the objects array *(line 19)*, as there are currently only 3
	* Another item name should also be included in the item_name array *(line 21)* and the speakers array *(line 13)*, as there are currently only 3 as well
	* Currently, the attention and manipulation checks are based on the first and second trials, respectively, and use stimuli from the first three trials as distractors. This should not be a huge issue left unadjusted if more than 3 subtrials are added; if modifications are desired, consider modifying the input arrays *(lines 1356 through 1480)*, slides functions *(lines 848 through 1022)*, and display *(lines 198 through 287 of **experiment.html**)*

### Experiment aesthetics

More options for backgrounds, agents, and speaker voices may be added arbitrarily, as only the first n are considered, n being the number of subtrials (`total_trials_num` on line 8)

#### Background

* Add file to **images\\**, in the format "back<X>.jpg", where <X> is an integer without leading zeros
	* Note that many properties of the background, such as opacity and dimension (600px x 400px) are defined in **css\\local-style.css** *(lines 32-39)*
* The number of backgrounds should always be at least equal to `total_trials_num`

#### Agents

* As noted on line 12, there are several other agent options which were not used. These may be added back simply by modifying the `agents` array.
	* Caution: Reintroduce at your own risk: **css\\local-style.css** only controls for agent height *(lines 41 through 47)*, so any wider or narrower agents might result in strange animations.
* The number of agents should always be at least equal to `total_trials_num`

#### Speakers

* Add speaker initials to array *(line 7)*
* Additional speaker voice files should be included in the **\\audio** folder, named "xx\_recordings", where "xx" are representative initials of the speaker
	* See preexisting files for script and file-naming

##### Recording lengths

| text (script) | duration in ms |
| ------------- | -------------- |
| hellos | 200ish (under 2250) |
| I have something to tell you | under 1750 |
| let me show you something | under 2000 |
| oh look at that | 1500ish (under 1750) |
| oh wow (not squeaking) | under 2500 |
| oh wow (squeaking) | 2000ish (under 2250) |
| oops | under 1000 |
| \[generic property statement\] (not squeaking) | 1500ish (under 1750) |
| \[generic property statement\] (squeaking) | under 1500 |
| see? ... | 2000ish (under 2250) |
| there are ... on the table | 2500ish (under 3000) |
| watch this | 1000ish (under 1250) |


### Stimuli

#### Objects

* Add additional options for artifacts *(line 16)*, flowers *(line 17)*, or birds *(line 18)* &mdash; or add additional objects directly *(line 19)*
	* The current run_trial() and associated methods take into account the nature of the object, as each has a unique display width and property. If new objects are added, it is recommended that only color-changed variations of existing objects (e.g., a blue bird) are used to minimize CSS-related hair-pulling
* Note that unless `total_trials_num` *(line 8)* is modified, only the first three items in `objects` will be used in the trials

#### Item name

* Add elements to `item_name` *(line 21)*
	* Names of stimuli should appear in the form `[<singular>, <plural>]`
* Note that unless `total_trials_num` *(line 8)* is modified, only the first three items in `item_name` will be used in the trials

#### Number of examples

* Modify `n_examples` *(line 22)*
	* Currently, any number of examples less than or equal to 4 is supported; otherwise, layout redesign (see set_table() function starting on line 105, **css\\experiment.css**, ...) would be required

### Condition

* Modify `item_presentation_condition` *(line 23)*; for easy testing, the `_.shuffle()` may be omitted
* Preexisting conditions
	* `"generic+text"`: generic statement only with no animations or visuals
	* `"generic"`: agent and blanketed objects are displayed and generic statement is given, though agent does not interact with objects
	* `"gen+ped"`: agent and blanketed objects are displayed, generic statement is given, and agent demonstrates stated property
	* `"accidental"`: "just-arrived-here" agent accidentally demonstrates property
	* `"pedagogical"`: agent demonstrates stated property, without giving generic statement

# Directories

## \_shared

Contains js and css files from original experiment template

## audio

Contains sound check audio, object sound effects, and agent (narrator) voice tracks; current agent (narrator) voice tracks are mh, tg, and sb

## css

Contains local style css; formats experiment.html in addition to css files in \_shared

## images

Contains agent, object, and background images as well as Adobe Illustrator files for SVGs. Some

## js

Contains experiment.js

# Files

## experiment.html

Used to run experiment. Most relevant related files are contained in css (for local style) and js (experiment setup) directories.