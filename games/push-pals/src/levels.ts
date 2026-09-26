import { type Level, parseLevel } from './game/level';

// Difficulty is bounded per chapter and checked by the solver in levels.test.ts. The first
// three chapters are for a three-year-old: one box, then two, and no level can get stuck.
// From there levels are real puzzles, and every one can get stuck. Every board is at most
// 8x8 including walls, so tiles stay big on a phone.

export interface Chapter {
  readonly boxes: number;
  readonly minPushes: number;
  readonly maxPushes: number;
  /** If true, every level in the chapter needs a trick to solve. */
  readonly trick: boolean;
  /** If true, no level in the chapter can get stuck. Otherwise every level can. */
  readonly forgiving?: boolean;
  /** If true, every push in a level goes the same way. */
  readonly straight?: boolean;
  readonly levels: readonly string[];
}

export const MAX_BOARD = 8;

export const CHAPTERS: readonly Chapter[] = [
  {
    // One box, pushed one way to its goal. Each direction in turn, then a walk to reach the box.
    boxes: 1,
    minPushes: 1,
    maxPushes: 3,
    trick: false,
    forgiving: true,
    straight: true,
    levels: [
      `
#####
#@$.#
#####`,
      `
###
#.#
#$#
#@#
###`,
      `
######
#. $@#
######`,
      `
###
#@#
#$#
# #
#.#
###`,
      `
#######
#@ $ .#
#######`,
      `
###
#.#
# #
# #
#$#
#@#
###`,
      `
###
#@#
# #
#$#
# #
#.#
###`,
      `
#######
#.  $ #
##### #
#####@#
#######`,
    ],
  },
  {
    // One box that needs pushing two ways, so the player walks round it in between.
    boxes: 1,
    minPushes: 2,
    maxPushes: 4,
    trick: false,
    forgiving: true,
    levels: [
      `
#####
##@##
##$ #
#.  #
#####`,
      `
#####
###.#
#@$ #
##  #
#####`,
      `
######
###  #
#@ $ #
####.#
######`,
      `
######
#  ###
#  $@#
#.####
######`,
      `
######
###  #
###  #
#@$  #
####.#
######`,
      `
######
##@###
##$###
##   #
#.   #
######`,
      `
######
#  #@#
# $  #
# #  #
#.#  #
######`,
      `
#####
###.#
# # #
#@# #
# $ #
##  #
#####`,
    ],
  },
  {
    // Two boxes, and still no level can get stuck.
    boxes: 2,
    minPushes: 2,
    maxPushes: 5,
    trick: false,
    forgiving: true,
    levels: [
      `
####
#..#
#$$#
#@ #
#  #
####`,
      `
######
#.$@ #
#.$  #
#### #
######`,
      `
#####
#@$.#
##$ #
##. #
#####`,
      `
######
#@$.##
## $.#
##  ##
######`,
      `
######
#.$  #
#.$@##
######`,
      `
######
#.$ ##
#. $@#
######`,
      `
####
#  #
#@##
#$ #
# $#
#..#
####`,
      `
#######
####.##
#### ##
####$##
#@$  .#
#######`,
    ],
  },
  {
    // Two boxes. Every level can get stuck, so undo is part of the game from here.
    boxes: 2,
    minPushes: 4,
    maxPushes: 7,
    trick: false,
    levels: [
      `
######
#.$ ##
# $@##
#   .#
######`,
      `
######
## @ #
##$$ #
#.  .#
######`,
      `
######
####.#
#  $ #
#  $@#
# . ##
######`,
      `
#######
## @###
##$ $ #
#. .  #
#######`,
      `
######
#@  .#
# $ ##
# $ .#
######`,
      `
######
#. $ #
# $  #
#  @.#
######`,
      `
######
#.  ##
#  $@#
# $ .#
######`,
      `
######
#   .#
# $ @#
#  $ #
##.###
######`,
    ],
  },
  {
    // Two boxes, and each level needs a trick: a push that looks wrong, like moving a box off
    // a goal or back the way it came.
    boxes: 2,
    minPushes: 4,
    maxPushes: 6,
    trick: true,
    levels: [
      `
#######
#   $.#
#  $.@#
#######`,
      `
######
#@  ##
# $$##
#  ..#
######`,
      `
#####
#  @#
# $$#
###.#
###.#
#####`,
      `
#######
### $.#
#@$.  #
###   #
#######`,
      `
######
#.  @#
# $  #
## $.#
######`,
      `
######
####.#
#   @#
#  $ #
#.$ ##
######`,
      `
#######
#  ####
# $####
#@$ ..#
#######`,
      `
#######
#### @#
####$ #
#. .$ #
#######`,
    ],
  },
  {
    // Two boxes, bigger tricks.
    boxes: 2,
    minPushes: 7,
    maxPushes: 10,
    trick: true,
    levels: [
      `
#######
###  ##
###@$ #
###   #
#.. $ #
#######`,
      `
######
# .@##
#  $##
# $  #
##.  #
######`,
      `
########
#### @##
####$$ #
#..    #
########`,
      `
########
#.  $ @#
# $  . #
########`,
      `
######
# @ ##
#  $.#
# $  #
### .#
######`,
      `
#######
## @###
#  $  #
#.  $ #
#.##  #
#######`,
      `
#######
#..@  #
# $ $ #
####  #
#######`,
      `
#######
##   .#
#  $$ #
#  .###
#@  ###
#######`,
    ],
  },
  {
    // Three boxes.
    boxes: 3,
    minPushes: 5,
    maxPushes: 8,
    trick: false,
    levels: [
      `
#####
#.@ #
# $.#
#$$ #
#.  #
#####`,
      `
######
#.  .#
#$$  #
#@$. #
## ###
######`,
      `
######
##@  #
##$$.#
#. $ #
# .###
######`,
      `
#######
#.$ @ #
#   $ #
##.$.##
#######`,
      `
#######
#####.#
##### #
#. $ $#
# $.  #
# @ ###
#######`,
      `
#######
#.  ###
# $ @.#
# .$$ #
####  #
#######`,
      `
#######
#@   .#
# $.$ #
# $.###
#######`,
      `
######
#  @##
# $$##
# $.##
#.  .#
######`,
    ],
  },
  {
    // Three boxes with a trick.
    boxes: 3,
    minPushes: 5,
    maxPushes: 9,
    trick: true,
    levels: [
      `
#####
###.#
# $.#
#@$ #
# $.#
#####`,
      `
#####
#@ .#
# $$#
# $.#
###.#
#####`,
      `
######
#.. ##
##  .#
##$$$#
##@  #
######`,
      `
######
##. @#
## $ #
# .$##
#   ##
# $.##
######`,
      `
#####
#.. #
#$ $#
#  @#
##$.#
##  #
##  #
#####`,
      `
#####
##@ #
# $$#
# $.#
# . #
#.  #
#####`,
      `
#####
###.#
## .#
#.$ #
#$$ #
#@  #
#####`,
      `
#####
#   #
#. $#
# $ #
#$@ #
# ..#
#####`,
    ],
  },
  {
    // Three boxes, more pushes.
    boxes: 3,
    minPushes: 7,
    maxPushes: 10,
    trick: false,
    levels: [
      `
#####
#..##
#  ##
# $ #
#$$ #
# @.#
#####`,
      `
######
###.##
#. $##
##  ##
##$$##
##  @#
##  .#
######`,
      `
#####
#  .#
# $$#
#  .#
#  $#
##  #
#.@ #
#####`,
      `
######
##@ ##
##  ##
#.$$##
#$  ##
#.  .#
######`,
      `
#######
#.  ###
#  $  #
#.$$. #
#    @#
#######`,
      `
#######
#   #.#
#$$  @#
#.. $ #
#######`,
      `
########
#  ..  #
# $  $@#
#.   $ #
########`,
      `
#######
###  .#
###@$ #
##. $$#
#.    #
#######`,
    ],
  },
  {
    // Three boxes, long levels.
    boxes: 3,
    minPushes: 10,
    maxPushes: 14,
    trick: false,
    levels: [
      `
########
###  ###
###  ###
### $###
#@  $ .#
#.   $ #
###.   #
########`,
      `
#######
# ..$ #
###  .#
##  $ #
##  $##
##@  ##
#######`,
      `
#######
###.  #
#   $.#
#  $  #
###  ##
###.$##
### @##
#######`,
      `
########
###### #
#  ###.#
# $$ $.#
#@    .#
########`,
      `
#######
#   ###
#$ $###
#   ###
#. @  #
# .$. #
#######`,
      `
#######
#. @###
# .$  #
#  $  #
###.$ #
#######`,
      `
#######
#@ ####
# $# ##
#$ $  #
#     #
#.  ..#
#######`,
      `
########
#  .####
#  $ $ #
# $   .#
####@. #
########`,
    ],
  },
  {
    // Four boxes.
    boxes: 4,
    minPushes: 6,
    maxPushes: 10,
    trick: false,
    levels: [
      `
#######
# . $ #
#$. $@#
#..$ ##
#######`,
      `
######
#   ##
# $ ##
# $. #
#$$.@#
#..###
######`,
      `
########
### . ##
#@ $  ##
###.$ ##
###.$ ##
### $ .#
########`,
      `
#######
#     #
# . $$#
#@$ ..#
####$##
####.##
#######`,
      `
#######
#.  $.#
##$ $@#
##..$ #
#######`,
      `
######
##  .#
#.$ $#
#$$ .#
#  .@#
######`,
      `
######
#.  .#
#$$ $#
#@$  #
###..#
######`,
      `
#######
#####.#
#####@#
#  $  #
#$. $$#
#.   .#
#######`,
    ],
  },
  {
    // Four boxes with a trick.
    boxes: 4,
    minPushes: 8,
    maxPushes: 12,
    trick: true,
    levels: [
      `
#######
#@$ ..#
# $. .#
###$ $#
###   #
#######`,
      `
#######
###   #
###$$@#
#  .$.#
##$  ##
##. .##
#######`,
      `
#######
#  ####
#  $ @#
#  $$.#
#...$ #
#######`,
      `
#######
##  ###
#. $$ #
# $..@#
#. $ ##
#######`,
      `
######
# ..##
#   ##
# $.##
## $##
##$$.#
##  @#
######`,
      `
#######
##.  ##
##$  ##
# $$..#
#.  $##
#   @##
#######`,
      `
#######
####. #
#  . $#
#   $ #
#  $$ #
###@..#
#######`,
      `
#######
###   #
### $.#
#  @$ #
#  #$.#
## $.##
##.  ##
#######`,
    ],
  },
  {
    // Four boxes, the longest levels.
    boxes: 4,
    minPushes: 10,
    maxPushes: 14,
    trick: false,
    levels: [
      `
######
#@$ .#
#. $.#
# $ $#
##  .#
######`,
      `
#######
#  .###
#$    #
# $$ .#
#   $@#
#. .###
#######`,
      `
########
#.  ####
# $ # .#
#  @ .$#
#$$ #  #
#  .####
########`,
      `
#######
###.###
###.###
#   #@#
# $$$ #
#.$   #
####. #
#######`,
      `
######
#.. ##
# @$##
# $$.#
# $. #
##   #
######`,
      `
#####
#@  #
#$$ #
# $ #
#. $#
#   #
#...#
#####`,
      `
#######
#### .#
#. $$ #
#   $.#
# $@ .#
# #####
#######`,
      `
######
#   .#
#@$ $#
##$$ #
#. .##
#   ##
#.  ##
######`,
    ],
  },
];

export const LEVELS: readonly Level[] = CHAPTERS.flatMap((chapter) =>
  chapter.levels.map(parseLevel),
);

/** Where each Chapter starts in LEVELS, the numbering saves use: Chapter c's Level i is FIRST[c] + i. */
export const FIRST: readonly number[] = CHAPTERS.map((_, c) =>
  CHAPTERS.slice(0, c).reduce((n, chapter) => n + chapter.levels.length, 0),
);
