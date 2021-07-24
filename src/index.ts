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
    const usage = getUsage({
      cwd: this.cwd,
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      eventDataCollector: this.eventDataCollector,
    });
    if (usage.length === 0) {
      this.log('No step definitions');
      return;
    }
    const table = new Table({
      head: ['Pattern / Text', 'Usage', 'Location'],
      style: {
        border: [],
        head: [],
      },
    });
    usage.forEach(({ line, matches, meanDuration, pattern, patternType, uri }) => {
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
