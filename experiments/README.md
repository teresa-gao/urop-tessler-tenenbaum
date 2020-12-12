*last updated 20 November 2020*

# Overview

## To run the experiment...

...open **experiment.html**; this should pop open in your browser window. If you're on Chrome, you can hit `Ctrl+Shift+I` (Windows) to pull up the Inspector and see what's being logged. You can type `exp.go()` directly into the console to advance past slides.

## To edit the experiment...

...open **experiment.js** in your favorite text editor. If you have Inspector pulled up as you run the experiment and add `console.log("your message here")` or `debugger;`, then you can keep track of where you are and what's going on. (Details about editing **experiment.js** are below.)

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

## version2

Contains previous experiment version's code (prior to 2020-10-29). Note that only files and subdirectories which differ from the current ones are included.

## js

Contains experiment.js.

### **experiment.js** structure

* **Variable declarations.** Much of the experiment can be modified solely by changing these variable values
* **Helper functions.** These are used primarily in `slides.trials` (trials slide).
* **Main program.** These include intro slide, catch trials (attention checks), trial slides (animated experiment and followup questions), optional demographic questions, and thank-you (data submission to Prolific/proliferate).
* **Init and setup.**  Here, we create the data frames which are passed as stim to the slides and/or used to collect data to be submitted to Prolific and declare `exp.structure`. *If you're playing around with the experiment, start here: try commenting out parts of `exp.structure` to see what they do.*

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

| text (script) \| agent action                                                                            | duration in ms\* | accidental? | pedagogical? | generic? | gen+ped? |
| ---------------------------------------------------------------------------------------------------------| ---------------- | ----------- | ------------ | -------- | -------- |
| *Agent appears on planet with background.*                                                               |                  | Y           | Y            | Y        | Y        |
| "Hello! I am a new researcher. I just arrived on this planet."                                           | 5500             | Y           | N            | N        | N        |
| "Hello! I've been doing research on this planet for a while."                                            | 5525             | N           | Y            | Y        | Y        |
| "I don't know anything about the animals, plants, or objects here."                                      | 6000             | Y           | N            | N        | N        |
| "I know all about the animals, plants, and objects here."                                                | 5550             | N           | Y            | Y        | Y        |
| "I have something to tell you..."                                                                        | TBD              | N           | N            | Y        | Y        |
| "<property\>."                                                                                           | TBD              | N           | N            | Y        | Y        |
| "I have something to show you. Follow me!"                                                               | 4250             | N           | Y            | N        | Y        |
| *Agent appears on planet with background and birds in tree, plants in dirt pile, or artifacts on table.* |                  | Y           | Y            | N        | Y        |
| "Hmm, I wonder what we have here."                                                                       | 3500             | Y           | N            | N        | N        |
| "Oh, I see! This is a <sing. object name\>." \| "Oh, I see! These are <pl. object name\>."               | 4000             | Y           | N            | N        | N        |
| "This is a <sing. object name\>." \| "These are <pl. object name\>."                                     | 2000             | N           | Y            | N        | Y        |
| "Watch this!"                                                                                            | TBD              | N           | Y            | N        | Y        |
| *Agent moves toward object(s): object(s) reveal property.*                                               |                  | Y           | Y            | N        | Y        |
| "Oh wow! <property\>!"                                                                                   | 3500             | Y           | N            | N        | N        |
| "See? <property\>!"                                                                                      | 3000             | N           | Y            | N        | Y        |

\* After recording and clipping, the actual length of each MP3 should be 250-750 ms less than this value so the audio tracks don't seem clipped, since some browsers may cause unpredictable delays.

##### Followup questions

| comprehension check?\* | prompt                                                                                                                                                    | response type                  | accidental? | pedagogical? | generic? | gen+ped? |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------- | ------------ | -------- | -------- |
| N                      | "Imagine that you come across a(nother) <sing. object name\>. What are the chances that it <has property\>?"                                              | slider (0% to 100%, labeled)   | Y           | Y            | Y        | Y        |
| Y                      | "What is the name of the item you learned about? Please select its name from the options below."                                                          | grid (radio button)            | Y           | Y            | Y        | Y        |
| N                      | "Would you say the following is true? <generic statement\>."                                                                                              | multiple choice (radio button) | Y           | Y            | Y        | Y        |
| N                      | "Please refer to the image below. Did this character know that <pl. object name\> could have <property\> before you observed it together?"                | multiple choice (radio button) | Y           | Y            | N        | Y        |
| Y                      | "Please refer to the image below. Is this character a new researcher who just arrived here, or have they been doing research on this planet for a while?" | multiple choice (radio button) | Y           | Y            | Y        | Y        |
| N                      | "In the text box below, please describe briefly what happened in this experiment." \*\*                                                                   | freeform (text box)            | Y           | Y            | Y        | Y        |

\* Comprehension checks are objective facts used to gauge how well a participant is paying attention; other followups reflect the ambiguity this experiment aims to study.
\*\* Included for data quality assessment purposes; responses should be individually, humanly reviewed