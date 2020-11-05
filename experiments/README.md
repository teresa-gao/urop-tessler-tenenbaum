*last updated 25 September 2020*

# Overview

## To run the experiment...

...open **experiment.html**; this should pop open in your browser window.

## To edit the experiment...

...open **experiment.js** in your favorite text editor.

# Files

## experiment.html

Used to run experiment. Most relevant related files are contained in css (for local style) and js (experiment setup) directories.

# Directories

## \_shared

Contains js and css files from original experiment template.

## audio

Contains sound check audio, object sound effects, and agent (narrator) voice tracks; current agent (narrator) voice tracks are mh, tg, and sb.

## css

Contains local style css; formats experiment.html in addition to css files in \_shared.

## images

Contains agent, object, and background images as well as Adobe Illustrator files for SVGs.

## js

Contains experiment.js.

## version2

Contains previous experiment version's code (prior to 2020-10-29). Note that only files and subdirectories which differ from the current ones are included.

### Structure

* **Variable declarations.** Much of the experiment can be modified solely by changing these variable values
* **Helper functions.** These are used primarily in `slides.trials` (trials slide).
* **Main program.** These include intro slide, catch trials (attention checks), trial slides (animated experiment) and followup trials, optional personal info, and thank-you (data submission to Prolific).
* **Init and setup.**  Here, we create the data frames which are passed as stim to the slides and/or used to collect data to be submitted to Prolific and declare exp.structure.

### How does everything work within the slides?

#### slides.io
Introduction slide. Basic experiment instructions, contact info, etc.

#### slides.botcaptcha
"Botcaptcha", in which user must understand context ("Who is X talking to?") from situational ("X says to Y"). Confirms that user is not a bot and that user is capable of comprehending basic information given in English.

#### slides.sound_check
Additional semi-botcaptcha, in which user must type the word that they hear. Checks that they are paying attention &mdash; the description contains slightly misleading instructions &mdash; and are capable of listening to spoken English. (While the narration and sound effects throughout accompany written text and visible cues, this check for a suitable sound system ensures consistency for all participants.)

#### slides.introduction
Provides context for following experimental task.

#### slides.trials
Contains both experimental trials as well as followup comprehension checks.

##### Scripts
Currently, only pedagogical and accidental conditions are in use.

| text (script) \| agent action                                                                            | duration in ms\* | accidental? | pedagogical? |
| ---------------------------------------------------------------------------------------------------------| ---------------- | ----------- | ------------ |
| *Agent appears on planet with background.*                                                               | TBD              | Y           | Y            |
| "Hello! I am a new researcher. I just arrived on this planet."                                           | TBD              | Y           | N            |
| "Hello! I've been doing research on this planet for a while."                                            | TBD              | N           | Y            |
| "I don't know anything about the animals, plants, or objects here."                                      | TBD              | Y           | N            |
| "I know all about the animals, plants, and objects here."                                                | TBD              | N           | Y            |
| "I have something to show you. Follow me!"                                                               | TBD              | N           | Y            |
| *Agent appears on planet with background and birds in tree, plants in dirt pile, or artifacts on table.* | TBD              | Y           | Y            |
| "Hmm, I wonder what we have here."                                                                       | TBD              | Y           | N            |
| "Oh, I see! This is a <sing. object name\>." \| "Oh, I see! These are <pl. object name\>."               | TBD              | Y           | N            |
| "This is a <sing. object name\>." \| "These are <pl. object name\>."                                     | TBD              | N           | Y            |
| "Watch this!"                                                                                            | TBD              | N           | Y            |
| *Agent moves toward object(s): object(s) reveal property.*                                               | TBD              | Y           | Y            |
| "Oh wow! <property\>!"                                                                                   | TBD              | Y           | N            |
| "See? <property\>!"                                                                                      | TBD              | N           | Y            |

\* After recording and clipping, the actual length of each MP3 should be 250-750 ms less than this value so the audio tracks don't seem clipped, especially when considering that some browsers may cause unpredictable delays.

##### Followup (comprehension) checks

| prompt                                                                                                                                     | response type                  |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| "What is the name of the item you learned about? Please select its name from the options below."                                           | grid (radio button)            |
| "Please refer to the image below. Did this character know that <pl. object name\> could have <property\> before you observed it together?" | multiple choice (radio button) |
| "Imagine that you come across another <sing. object name\>. What are the chances that it <has property\>?"                                 | slider (0% to 100%, labeled)   |
| "Would you say the following is true? <generic statement\>."                                                                               | slider (0% to 100%, labeled)   |
| "In the text box below, please describe briefly what happened in this experiment." \*                                                      | freeform (text box)            |

\* included for data quality assessment purposes.