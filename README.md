# cucumber6-static-usage

[![npm version](https://img.shields.io/npm/v/cucumber6-static-usage.svg)](https://www.npmjs.com/package/cucumber6-static-usage)

Static steps usage reporter for cucumber-js v6.

This reporter is inspired by the built-in `usage` reporter without limiting the matches to the first five:
this reporter gives you the usage for all steps without any limitation, so the generated report might be huge.

## To install this steps usage reporter

- run the command:

  ```sh
  npm install --save cucumber6-static-usage
  ```

## Usage

- add to the cucumber-js command-line the following option:

  ```sh
  --format node_modules/cucumber6-static-usage:steps-usage.txt --dry-run
  ```

You should run `cucumber-js` in dry mode, because this reporter does not handle test execution results and durations.

## What it generates

Here is a sample that corresponds to this feature file:

`simple-maths.feature`:

```gherkin
@foo
Feature: Simple maths
  In order to do maths
  As a developer
  I want to increment variables

Background: Calculator
  Given I have a simple maths calculator

Scenario: easy maths
  Given a variable is set to 11
  When I increment this variable by 1
  Then the variable should contain 12
  When I increment this variable by 2
  Then the variable should contain 14
  When I increment this variable by 2
  Then the variable should contain 16

Scenario Outline: much more complex stuff
  Given a variable is set to <var>
  When I increment this variable by <increment>
  When I increment this variable by 2
  Then the variable should contain <result>
  Examples:
    | var | increment | result |
    | 100 | 5         | 105    |
    | 99  | 1234      | 1333   |
    | 12  | 5         | 17     |

```

`steps-usage.txt`:

```txt
┌────────────────────────────────────────────┬────────┬─────────────────────────────────────────────────┐
│ Pattern / Text                             │ Usage  │ Location                                        │
├────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────┤
│ I have a simple maths calculator           │ -      │ step-definitions/maths/simple-maths-steps.ts:5  │
│   I have a simple maths calculator         │ -      │ features/simple-maths.feature:8                 │
├────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────┤
│ a variable is set to {int}                 │ -      │ step-definitions/maths/simple-maths-steps.ts:9  │
│   a variable is set to 11                  │ -      │ features/simple-maths.feature:11                │
│   a variable is set to <var>               │ -      │ features/simple-maths.feature:20                │
├────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────┤
│ I increment this variable by {int}         │ -      │ step-definitions/maths/simple-maths-steps.ts:13 │
│   I increment this variable by 1           │ -      │ features/simple-maths.feature:12                │
│   I increment this variable by 2           │ -      │ features/simple-maths.feature:14                │
│   I increment this variable by 2           │ -      │ features/simple-maths.feature:16                │
│   I increment this variable by 2           │ -      │ features/simple-maths.feature:22                │
│   I increment this variable by <increment> │ -      │ features/simple-maths.feature:21                │
├────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────┤
│ I foobar this variable by {int}            │ UNUSED │ step-definitions/maths/simple-maths-steps.ts:17 │
├────────────────────────────────────────────┼────────┼─────────────────────────────────────────────────┤
│ the variable should contain {int}          │ -      │ step-definitions/maths/simple-maths-steps.ts:21 │
│   the variable should contain 12           │ -      │ features/simple-maths.feature:13                │
│   the variable should contain 14           │ -      │ features/simple-maths.feature:15                │
│   the variable should contain 16           │ -      │ features/simple-maths.feature:17                │
│   the variable should contain <result>     │ -      │ features/simple-maths.feature:23                │
└────────────────────────────────────────────┴────────┴─────────────────────────────────────────────────┘

```
