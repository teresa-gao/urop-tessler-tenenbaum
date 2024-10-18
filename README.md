# Overview

## Project Contributors

- Teresa Gao
- MH Tessler

## Summary

As a two-semester [UROP](https://urop.mit.edu) project of the [MIT Computational Cognitive Science Group](https://cocosci.mit.edu/), a psycholinguistics experiment was developed to investigate the relative strength of inference derived from generic language (e.g., "feps have green feathers") versus live examples (e.g., encountering a fep with green feathers). A previous version of the study was overhauled to introduce cleaner animations and interactive elements, implemented using JavaScript.

Using the online crowdsourcing research platforms Amazon Mechanical Turk (MTurk) and Prolific, pilot trials were run on over 400 total participants, and the design of the experiment was continually iterated upon to account for possible nuances in participant interpretation (e.g., does the setup seem accidental enough for trials where the situation is supposed to seem so, or is the presentation over a digital platform inherently indicative of intentionality?). Data analyses were conducted in R/RStudio to identify and visualize statistical patterns in the results.


## Demo

https://www.mit.edu/~t_gao/projects/genex/experiments/experiment.html


# Repository Structure

## analysis

The analysis folder contains files used to extract and visualize the experiment data.

## experiments

The experiments folder contains the files needed to run experiments. The js, cs, audio, and images folders contain files needed to run experiment.html; the \_shared directory contains js and css files from the original experiment template.

## mturk

Formerly used to run experiments on MTurk. Contains nosub configuration and raw downloaded results.

## prolific

Used to run experiments on Prolific. Contains proliferate configuration and raw downloaded results.

## .gitignore

This file specifies which files should not be pushed to a publicly available platform such as GitHub. This mostly includes personally identifiable study participant information.
