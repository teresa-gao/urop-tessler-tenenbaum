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

### Structure

* **Variable declarations.** Much of the experiment can be modified solely by changing these variable values
* **Functions.** These are used primarily in `slides.trials` (trials slide).
* **Slides.** These include intro slide, catch trials, (experimental) trial slides, followup trials, optional info, and thank-you (data submission to MTurk).
* **Setup.**  Here, we create the data frames which are passed as stim into slides.trials, slides.attention_check, and slides.manipulation_check and/or used to collect data to be submitted to MTurk; declare exp.structure; and set up things such as Unique Turker.

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
Contains both experimental trials (display and slider response) as well as followup comprehension checks.

##### Scripts
Currently, only pedagogical, accidental, and naive conditions are in use.

| text (script) \| agent action                                                                               | duration in ms\* | accidental\*\*? | naive? | pedagogical? |
| ----------------------------------------------------------------------------------------------------------- | ---------------- | --------------- | ------ | ------------ |
| "Hello! I've been doing research on this planet for a while."                                               | 4750             | N               | N      | Y            |
| "Hello! I am a new researcher. I just arrived on this planet."                                              | 4000             | Y               | Y      | N            |
| "Here we have a <sing. object name\> on the table." \| "Here we have some <pl. object name\> on the table." | 3500             | N               | N      | Y            |
| "Hmm, I wonder what we have here on the table."                                                             | 3500             | Y               | Y      | N            |
| "Oh, I see! This is a <sing. object name\>." \| "Oh, I see! These are <pl. object name\>."                  | 4000             | Y               | Y      | N            |
| "I know all about <pl. object name\>."                                                                      | 3000             | N               | N      | Y            |
| "I don't know anything about <pl. object name\>."                                                           | 3000             | Y               | Y      | N            |
| "Let me show you something."                                                                                | 2000             | N               | N      | Y            |
| "Let's take a look."                                                                                        | 1750             | N               | Y      | N            |
| *Agent interacts with blanket.*                                                                             |                  | Y               | Y      | Y            |
| "Watch this!"                                                                                               | 1750             | N               | N      | Y            |
| *Blanket falls off, revealing object.*                                                                      |                  | Y               | Y      | Y            |
| "Oops!"                                                                                                     | 1000             | Y               | N      | N            |
| *Object reveals its property.*                                                                              |                  | Y               | Y      | Y            |
| "See? <non-squeaking property\>!"                                                                           | 3000             | N               | N      | Y            |
| "Oh wow! <non-squeaking property\>!"                                                                        | 3500             | Y               | Y      | N            |
| "See? Squeaking!"                                                                                           | 2500             | N               | N      | Y            |
| "Oh wow! Squeaking!"                                                                                        | 3000             | Y               | Y      | N            |
| "Let me show you another one."                                                                              | 2500             | N               | N      | Y            |
| "Let's look at another one."                                                                                | 2250             | N               | Y      | N            |

\* After recording and clipping, these MP3s should be 250-750 ms less than this value so the audio tracks don't seem clipped.
\*\* The accidental trial displays only a single object and agent at once, repeated with the same object and a different agent for however many times is specified by `total_trials_num` in **experiment.js**.

##### Followup (comprehension) checks

table with prompt ("Would you say the following is true?"), condition
"What are the names of the " + total_trials_num + " items you learned about? Please select its/their name/names from the options below.
Please refer to the image below. How long has this character been doing research on this planet?
"Please refer to the image below. Did this character know that " + article_statement + " " + have_property + " before you observed it together?"
In the text box below, please describe briefly what happened in this experiment.

| prompt                                                                                                                                     | answer type                    | accidental? | naive? | pedagogical? |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ----------- | ------ | ------------ |
| "Would you say the following is true? <generic statement\>."                                                                               | slider (0% to 100%, labeled)   | Y           | Y      | Y            |
| "What is/are the names of the <total trials num.\>" items you learned about?"                                                              | grid (checkboxes)              | Y           | Y      | Y            |
| "Please refer to the image below. How long has this character been doing research on this planet?"                                         | multiple choice (radio button) | Y           | Y      | Y            |
| "Please refer to the image below. Did this character know that <pl. object name\> could have <property\> before you observed it together?" | multiple choice (radio button) | Y           | Y      | Y            |
| "In the text box below, please describe briefly what happened in this experiment."\*                                                       | freeform (text box)            | Y           | Y      | Y            |

\* This is included for data quality assessment purposes.`