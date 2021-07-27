import { durationToMilliseconds, formatLocation, getUsage } from './helpers';
import { Formatter } from './helpers/formatter-base';
import { IFormatterOptions } from './helpers/types';
import { doesHaveValue } from './helpers/value_checker';
import Table from 'cli-table3';

class CustomUsageFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options);
    options.eventBroadcaster.on('test-run-finished', () => {
      this.logUsage();
    });
  }

  logUsage(): void {
    const usages = getUsage({
      cwd: this.cwd,
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      eventDataCollector: this.eventDataCollector,
    });
    if (usages.length === 0) {
      this.log('No step definitions');
      return;
    }
    const allPatternsLength = usages.map((usage) => usage.pattern.length).map((n) => n + 2);
    const patternMaxLength = Math.max(...allPatternsLength);

    const allMatchesLength = usages
      .map((usage) => usage.matches)
      .flat()
      .map((m) => m.text?.length || 0)
      .map((n) => n + 4);

    const maxLength = Math.max(...allMatchesLength, patternMaxLength);

    const guessWidth =
      maxLength > 100
        ? Math.floor((allMatchesLength.reduce((a, b) => a + b, 0) / allMatchesLength.length) * 1.4)
        : maxLength;

    let bestWidth = guessWidth;
    let loopCounter = 0;
    const maxLoopCounter = 100;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (bestWidth > 100) {
        break;
      }
      if (loopCounter > maxLoopCounter) {
        break;
      }
      loopCounter += 1;
      bestWidth += 2;
      const percentage =
        allMatchesLength.filter((n) => n <= bestWidth).length / allMatchesLength.length;
      if (percentage > 0.8) {
        break;
      }
    }

    const firstColWidth = Number(
      process.env['STEPS_USAGE_REPORT_FIRST_COL_WIDTH'] || Math.min(100, bestWidth),
    );
    const table = new Table({
      head: ['Pattern / Text', 'Usage', 'Location'],
      colWidths: [firstColWidth, null, null],
      style: {
        border: [],
        head: [],
      },
    });
    usages.forEach(({ line, matches, meanDuration, pattern, patternType, uri }) => {
      let formattedPattern = pattern;
      if (patternType === 'RegularExpression') {
        formattedPattern = '/' + formattedPattern + '/';
      }
      const col1 = [formattedPattern];
      const col2 = [];
      if (matches.length > 0) {
        if (doesHaveValue(meanDuration)) {
          col2.push(
            `${durationToMilliseconds(meanDuration || { seconds: 0, nanos: 0 }).toFixed(2)}ms`,
          );
        } else {
          col2.push('-');
        }
      } else {
        col2.push('UNUSED');
      }
      const col3 = [formatLocation({ line, uri })];
      matches.forEach((match) => {
        col1.push(`  ${match.text}`);
        if (doesHaveValue(match.duration)) {
          col2.push(
            `${durationToMilliseconds(match.duration || { seconds: 0, nanos: 0 }).toString()}ms`,
          );
        } else {
          col2.push('-');
        }
        col3.push(formatLocation(match));
      });

      table.push([col1.join('\n'), col2.join('\n'), col3.join('\n')]);
    });
    this.log(`${table.toString()}\n`);
  }
}

module.exports = CustomUsageFormatter;
