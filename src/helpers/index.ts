import {
  Duration,
  GherkinDocument,
  IGetUsageRequest,
  IUsage,
  IUsageMatch,
  MILLISECONDS_PER_SECOND,
  NANOSECONDS_PER_MILLISECOND,
  Step,
  StepDefinition,
} from './types';
import { doesHaveValue } from './value_checker';
import path from 'path';

function getCodeAsString(stepDefinition: StepDefinition): string {
  if (typeof stepDefinition.unwrappedCode === 'function') {
    return stepDefinition.unwrappedCode.toString();
  }
  return stepDefinition.code.toString();
}

function buildEmptyMapping(stepDefinitions: StepDefinition[]): Record<string, IUsage> {
  const mapping: Record<string, IUsage> = {};
  stepDefinitions.forEach((stepDefinition) => {
    const location = `${stepDefinition.uri}:${stepDefinition.line}`;
    mapping[location] = {
      code: getCodeAsString(stepDefinition),
      line: stepDefinition.line,
      pattern: stepDefinition.expression.source,
      patternType: stepDefinition.expression.constructor.name,
      matches: [],
      uri: stepDefinition.uri,
    };
  });
  return mapping;
}

function getGherkinStepMap(gherkinDocument: GherkinDocument): Record<string, Step> {
  const result: Record<string, Step> = {};
  gherkinDocument.feature.children
    .filter(
      (child) =>
        child.type === 'Scenario' ||
        child.type === 'ScenarioOutline' ||
        child.type === 'Background',
    )
    .map((child) => child.steps)
    .flat()
    .forEach((step) => {
      step.id = step.id || step.location.line.toString();
      result[step.id] = step;
    });

  return result;
}

function isNewMatch(match: IUsageMatch, matches: IUsageMatch[]): boolean {
  if (matches.length === 0) {
    return true;
  }

  return !matches.some(
    (m) => m.text === match.text && m.line === match.line && m.uri === match.uri,
  );
}

function buildMapping({
  stepDefinitions,
  eventDataCollector,
}: IGetUsageRequest): Record<string, IUsage> {
  const mapping = buildEmptyMapping(stepDefinitions);
  eventDataCollector.getTestCaseAttempts().forEach((testCaseAttempt) => {
    const gherkinStepMap = getGherkinStepMap(testCaseAttempt.gherkinDocument);
    testCaseAttempt.testCase.steps
      .filter((step) => step.actionLocation && step.sourceLocation)
      .forEach((testStep) => {
        const stepDefinitionId = `${testStep.actionLocation.uri}:${testStep.actionLocation.line}`;
        const gherkinStep = gherkinStepMap[testStep.sourceLocation.line.toString()];
        const match: IUsageMatch = {
          line: gherkinStep.location.line,
          text: gherkinStep.text,
          uri: testStep.sourceLocation.uri,
        };

        if (mapping[stepDefinitionId] && isNewMatch(match, mapping[stepDefinitionId].matches)) {
          mapping[stepDefinitionId].matches.push(match);
        }
      });
  });
  return mapping;
}

function toMillis(seconds: number, nanos: number): number {
  const secondMillis = +seconds * MILLISECONDS_PER_SECOND;
  const nanoMillis = nanos / NANOSECONDS_PER_MILLISECOND;
  return secondMillis + nanoMillis;
}

export function durationToMilliseconds(duration: Duration): number {
  const { seconds, nanos } = duration;
  return toMillis(seconds, nanos);
}

export interface ILineAndUri {
  line: number;
  uri: string;
}
export function formatLocation(obj: ILineAndUri, cwd?: string): string {
  let uri = obj.uri;
  if (doesHaveValue(cwd)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    uri = path.relative(cwd!, uri);
  }
  return `${uri}:${obj.line.toString()}`;
}
function toSecondsAndNanos(milliseconds: number) {
  const seconds = Math.floor(milliseconds / MILLISECONDS_PER_SECOND);
  const nanos = Math.floor((milliseconds % MILLISECONDS_PER_SECOND) * NANOSECONDS_PER_MILLISECOND);
  return { seconds, nanos };
}
function millisecondsToDuration(durationInMilliseconds: number): Duration {
  return toSecondsAndNanos(durationInMilliseconds);
}

function normalizeDuration(duration?: Duration): number {
  if (duration == null) {
    return Number.MIN_SAFE_INTEGER;
  }
  return durationToMilliseconds(duration);
}

function buildResult(mapping: Record<string, IUsage>): IUsage[] {
  return Object.keys(mapping)
    .map((stepDefinitionId) => {
      const { matches, ...rest } = mapping[stepDefinitionId];
      const sortedMatches = matches.sort((a: IUsageMatch, b: IUsageMatch) => {
        if (a.duration === b.duration) {
          return a.text < b.text ? -1 : 1;
        }
        return normalizeDuration(b.duration) - normalizeDuration(a.duration);
      });
      const result = { matches: sortedMatches, ...rest };
      const durations = matches
        .filter((m) => m.duration != null)
        .map((m) => m.duration || { seconds: 0, nanos: 0 });
      if (durations.length > 0) {
        const totalMilliseconds = durations.reduce((acc, x) => acc + durationToMilliseconds(x), 0);
        result.meanDuration = millisecondsToDuration(totalMilliseconds / durations.length);
      }
      return result;
    })
    .sort(
      (a: IUsage, b: IUsage) =>
        normalizeDuration(b.meanDuration) - normalizeDuration(a.meanDuration),
    );
}

export function getUsage({ cwd, stepDefinitions, eventDataCollector }: IGetUsageRequest): IUsage[] {
  const mapping = buildMapping({ cwd, stepDefinitions, eventDataCollector });
  return buildResult(mapping);
}
