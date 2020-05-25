# Overview

## To run the experiment...

...open experiment.html

## To edit the experiment...

...open experiment.js

Most of the experiment components (number of subtrials, conditions, agents, speakers, etc.) can be modified straightforwardly via variables at the top of the file.

### Number of subtrials

See total_trials_num (line 2)

If more than 3 subtrials are desired, then (an) additional object(s) option must be included in the objects array (line 13), as there are currently only 3. Another item name should also be included in the item_name array (line 15) and the speakers array (line 7), as there are currently only 3 as well. No other significant changes should need to be made.

### Experiment aesthetics (background, agents, speakers)

See back (line 5), agents (line 6), and speakers (line 7)

More options for backgrounds, agents, and speaker voices may be added arbitrarily, as only the first n are considered, n being the number of subtrials (total_trials_num on line 2). Additional speaker voice files should be included in the *audio* folder, named "xx\_recordings", where "xx" are representative initials of the speaker.

If a left-pointing agent condition were desired, then the layout (in experiment.css) and a method analogous to agent_point_r() (line 34) may need to be adapted; run_trial() (line 284) should also take into account the direction of the agent. The \_point\_l versions of each agent must be cropped; alternatively, they can be rederived from the correctly cropped \_point\_r versions by reflecting horizontally. As this would also require manipulating the math in local-style.css as well as any part of experiment.js in which object locations are set, this is not recommended.

### Stimuli/exemplars/objects

See objects (line 13), item_name (line 15), and n_examples (line 16)

The current run_trial() and associated methods take into account the nature of the object, as each has a unique display width and property. If new objects are added, it is recommended that only color-changed variations of existing objects (e.g., a blue bird) are used to minimize CSS-related hair-pulling.

n_examples would require layout redesign (see set_table() function starting on line 95, experiment.css, ...) if more than 4 examples are desired, though currently any number of examples up to 4 is supported.

### Condition

See item_presentation_condition (line 17)

item_presentation_condition would require additional coding in run_trial function starting on line 284 to accommodate any conditions that are not generic, gen+ped, accidental, or pedagogical.

# Directories

## \_shared

Contains js and css files from original experiment template

## audio

Contains sound check audio, object sound effects, and agent (narrator) voice tracks.

## css

Contains local style css; formats experiment.html in addition to css files in \_shared

## images

Contains agent, object, and background images as well as Adobe Illustrator files for SVGs. Some

## js

Contains experiment.js

# Files

## experiment.html

Used to run experiment. Most relevant related files are contained in css (for local style) and js (experiment setup) directories.